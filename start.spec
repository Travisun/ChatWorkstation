# start.spec
# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

a = Analysis(
    ['start.py'],
    pathex=['.','third_party/open_webui/backend'],
    binaries=[],
    datas=[],
    name='Backend',
    hiddenimports=["black","hnswlib","chromadb","pypika","backoff","posthog","passlib","scipy","transformers","pathspec","blib2to3"],
    hookspath=["build_tools/hooks"],
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
)
pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)
exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='Backend',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True,
    icon='src/app/src/static/applogo-180.ico'  # 添加此行来设置图标
)
coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='ChatWorkstation',
    workpath='dist',  # 修改为临时工作目录
    console=True,
    upx_dir='build_tools/upx'  # Windows 上 UPX 可执行文件的路径
    # upx_dir='/usr/local/bin/upx'  # Unix 系统上 UPX 可执行文件的路径
)
