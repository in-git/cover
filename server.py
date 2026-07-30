#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
文件资源管理服务器
- 管理两类资源: 图片 / 字体
- 提供 REST API 与静态资源访问
- 支持多文件上传, 支持文件夹拖拽上传 (前端递归读取后批量提交)
"""
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from pathlib import Path
import re

app = Flask(__name__)
CORS(app)

# ===== 资源存储根目录 =====
RESOURCE_ROOT = Path(__file__).parent / 'uploads'

# 分类配置: 扩展名 -> 分类
CATEGORIES = {
    'images': {
        'extensions': {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'},
        'dir': RESOURCE_ROOT / 'images'
    },
    'fonts': {
        'extensions': {'.ttf', '.otf', '.woff', '.woff2'},
        'dir': RESOURCE_ROOT / 'fonts'
    }
}

# 启动时确保目录存在
for cfg in CATEGORIES.values():
    cfg['dir'].mkdir(parents=True, exist_ok=True)


def detect_category(filename):
    """根据扩展名判断资源分类, 不匹配返回 None"""
    ext = Path(filename).suffix.lower()
    for cat, cfg in CATEGORIES.items():
        if ext in cfg['extensions']:
            return cat
    return None


def safe_filename(name):
    """安全化文件名: 去除路径分隔符与非法字符, 保留中文。

    werkzeug.secure_filename 会清掉中文字符, 这里改用自定义实现,
    仅过滤操作系统层面的非法字符 (\\ / : * ? " < > |) 与控制字符。
    """
    if not name:
        return ''
    # 只取文件名部分 (前端可能传来带路径的 webkitRelativePath)
    name = name.replace('\\', '/').split('/')[-1]
    # 过滤非法字符
    name = re.sub(r'[\\/:*?"<>|\x00-\x1f]', '_', name).strip()
    # 防止以 . 开头形成隐藏文件
    if name and name[0] == '.':
        name = '_' + name
    return name


def unique_path(cat_dir, filename):
    """若文件已存在, 自动追加 _1 / _2 ... 后缀, 避免覆盖"""
    target = cat_dir / filename
    if not target.exists():
        return target
    stem, suffix = target.stem, target.suffix
    i = 1
    while target.exists():
        target = cat_dir / f'{stem}_{i}{suffix}'
        i += 1
    return target


@app.route('/api/resources')
def list_resources():
    """列出资源

    GET /api/resources              -> 返回所有分类 {images: [...], fonts: [...]}
    GET /api/resources?category=images -> 返回指定分类列表
    """
    category = request.args.get('category', '').strip()
    result = {}

    cats = [category] if category and category in CATEGORIES else list(CATEGORIES.keys())
    for cat in cats:
        cat_dir = CATEGORIES[cat]['dir']
        files = []
        for f in sorted(cat_dir.iterdir(), key=lambda x: x.name.lower()):
            if not f.is_file():
                continue
            files.append({
                'name': f.name,
                'size': f.stat().st_size,
                'ext': f.suffix.lower(),
                'category': cat,
                'url': f'/uploads/{cat}/{f.name}',
                'updatedAt': int(f.stat().st_mtime)
            })
        result[cat] = files

    if category:
        return jsonify({'success': True, 'data': result.get(category, [])})
    return jsonify({'success': True, 'data': result})


@app.route('/api/upload', methods=['POST'])
def upload_files():
    """上传文件 (支持多文件批量上传)

    表单字段:
      files: 多个文件 (multipart)
      category: 可选, 显式指定分类 (images/fonts). 未指定时按扩展名自动归类
    """
    if 'files' not in request.files:
        return jsonify({'success': False, 'error': '未接收到文件'}), 400

    files = request.files.getlist('files')
    forced_category = request.form.get('category', '').strip()
    if forced_category and forced_category not in CATEGORIES:
        return jsonify({'success': False, 'error': f'非法分类: {forced_category}'}), 400

    uploaded = []
    skipped = []

    for f in files:
        if not f or not f.filename:
            continue
        filename = safe_filename(f.filename)
        if not filename:
            skipped.append(f.filename)
            continue

        # 优先使用前端显式指定的分类, 否则按扩展名自动判断
        cat = forced_category or detect_category(filename)
        if not cat:
            skipped.append(filename)
            continue

        save_path = unique_path(CATEGORIES[cat]['dir'], filename)
        f.save(save_path)
        uploaded.append({
            'name': save_path.name,
            'category': cat,
            'ext': save_path.suffix.lower(),
            'url': f'/uploads/{cat}/{save_path.name}',
            'size': save_path.stat().st_size
        })

    return jsonify({
        'success': True,
        'uploaded': uploaded,
        'skipped': skipped,
        'count': len(uploaded)
    })


@app.route('/api/resources/<category>/<filename>', methods=['DELETE'])
def delete_resource(category, filename):
    """删除指定资源"""
    if category not in CATEGORIES:
        return jsonify({'success': False, 'error': '分类不存在'}), 400
    filename = safe_filename(filename)
    if not filename:
        return jsonify({'success': False, 'error': '非法文件名'}), 400

    file_path = CATEGORIES[category]['dir'] / filename
    if not file_path.exists():
        return jsonify({'success': False, 'error': '文件不存在'}), 404

    try:
        file_path.unlink()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/uploads/<category>/<filename>')
def serve_uploads(category, filename):
    """提供资源文件静态访问 (前端通过此 URL 引用图片/字体)"""
    if category not in CATEGORIES:
        return jsonify({'error': '分类不存在'}), 404
    filename = safe_filename(filename)
    return send_from_directory(CATEGORIES[category]['dir'], filename)


if __name__ == '__main__':
    print("=" * 50)
    print("文件资源管理服务器启动中...")
    print("访问地址: http://localhost:5000")
    print(f"资源根目录: {RESOURCE_ROOT}")
    print("\nAPI 接口:")
    print("  GET    /api/resources              列出所有资源")
    print("  GET    /api/resources?category=X   列出指定分类资源")
    print("  POST   /api/upload                 上传文件 (支持多文件)")
    print("  DELETE /api/resources/<cat>/<name> 删除资源")
    print("  GET    /uploads/<cat>/<name>       访问资源文件")
    print("=" * 50)

    app.run(host='0.0.0.0', port=5000, debug=True)
