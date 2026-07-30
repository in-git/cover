#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
高清壁纸服务器 - 集成国内API
"""
from flask import Flask, jsonify, request, redirect
from flask_cors import CORS
import requests
import random
import re

app = Flask(__name__)
CORS(app)

# 360壁纸分类缓存
CATEGORY_360_MAP = {}  # {name: id}


def parse_tags(tag_str):
    """解析360壁纸的tag字段，提取真实分类列表。

    360返回的tag格式形如:
        '_全部_ _category_迈凯伦_  _category_尾翼_  _category_超级跑车_  _category_汽车天下_'
    需要拆成 ['迈凯伦', '尾翼', '超级跑车', '汽车天下']
    """
    if not tag_str:
        return []
    return re.findall(r'_category_([^_]+?)_', tag_str)


def fetch_categories():
    """获取360分类并缓存"""
    global CATEGORY_360_MAP
    try:
        cat_url = "http://cdn.apc.360.cn/index.php?c=WallPaper&a=getAllCategoriesV2&from=360chrome"
        response = requests.get(cat_url, timeout=10)
        data = response.json()
        print(f"errno: {data.get('errno')}, type: {type(data.get('errno'))}")

        if str(data.get("errno")) == "0":
            CATEGORY_360_MAP = {cat["name"]: str(cat["id"]) for cat in data.get("data", [])}
            print(f"Loaded {len(CATEGORY_360_MAP)} categories")
        else:
            print(f"API error: {data}")
    except Exception as e:
        print(f"Error fetching categories: {e}")


def get_360_images(count=20, category=""):
    """获取360壁纸"""
    all_images = []
    print(f'获取360壁纸, category={category}, MAP size={len(CATEGORY_360_MAP)}')
    try:
        # 确保分类已缓存
        if not CATEGORY_360_MAP:
            print("MAP为空，调用fetch_categories")
            fetch_categories()
            print(f"fetch后MAP size={len(CATEGORY_360_MAP)}")

        # 获取分类ID列表
        if category:
            category_ids = [CATEGORY_360_MAP.get(category, "1")]
        else:
            category_ids = list(CATEGORY_360_MAP.values())
        
        # 随机选择分类获取图片
        used_urls = set()
        for _ in range(count * 3):  # 多尝试几次以获取足够图片
            if len(all_images) >= count:
                break

            cat_id = random.choice(category_ids)
            url = f"http://wallpaper.apc.360.cn/index.php?c=WallPaper&a=getAppsByCategory&cid={cat_id}&start=0&count=20&from=360chrome"
            response = requests.get(url, timeout=10)

            data = response.json()
            print(f"errno: {data.get('errno')}, type: {type(data.get('errno'))}")
            if str(data.get("errno")) == "0":
                items = data.get("data", [])
                for item in items:
                    img_url = item.get("url", "")
                    if img_url and img_url not in used_urls:
                        # 转换URL为高清版本
                        img_url_hd = img_url.replace("/bdr/__85/", "/bdm/1920_1080_100/")

                        used_urls.add(img_url)
                        # 解析360的tag字段为真实分类列表
                        cats = parse_tags(item.get("tag", ""))
                        # 双保险: 确保用户请求的分类一定在列表里
                        if category and category not in cats:
                            cats.append(category)
                        if not cats:
                            cats = [category or "其他"]
                        cat_name = cats[0]

                        all_images.append({
                            "id": f"360_{cat_id}_{random.randint(1000, 9999)}",
                            "url": img_url_hd,
                            "thumbnail": img_url.replace("/bdr/__85/", "/bdm/400_300_80/"),
                            "title": cat_name,
                            "copyright": "",
                            "date": "",
                            "categories": cats,
                            "source": "360",
                            "width": 1920,
                            "height": 1080
                        })

                        if len(all_images) >= count:
                            break

    except Exception as e:
        print(f"Error fetching 360 images: {e}")

    return all_images[:count]


@app.route('/api/images')
def get_images():
    """获取壁纸列表"""
    count = int(request.args.get('count', 20))
    category = request.args.get('category', '')

    all_images = get_360_images(count, category)

    # 过滤分类
    if category:
        all_images = [img for img in all_images if category in img['categories']]

    random.shuffle(all_images)

    return jsonify({
        "success": True,
        "data": all_images[:count],
        "total": len(all_images)
    })

@app.route('/api/categories')
def get_categories():
    print(f"get_categories called, MAP size: {len(CATEGORY_360_MAP)}")
    if not CATEGORY_360_MAP:
        print("MAP empty, calling fetch_categories")
        fetch_categories()
    cats = list(CATEGORY_360_MAP.keys())
    print(f"Returning cats: {cats[:5]}")

    return jsonify({
        "success": True,
        "data": cats
    })


if __name__ == '__main__':
    print("=" * 50)
    print("高清壁纸服务器启动中...")
    print("访问地址: http://localhost:5000")
    print("=" * 50)

    # 启动时获取分类
    fetch_categories()
    print(f"已加载 {len(CATEGORY_360_MAP)} 个分类")

    print("\nAPI接口:")

    print("=" * 50)

    app.run(host='0.0.0.0', port=5000, debug=True)
