# -*- mode: python ; coding: utf-8 -*-
import sys
import os
from PyInstaller.utils.hooks import collect_all

block_cipher = None

# Collect dependencies
datas = []
binaries = []
hiddenimports = ['customtkinter', 'tkinterdnd2', 'PIL', 'edge_tts', 'ebooklib', 'bs4', 'deep_translator', 'mobi', 'fitz', 'docx', 'pypdf']
excludes = [
    'matplotlib', 'numpy', 'pandas', 'scipy', 'IPython', 'notebook', 
    'pygments', 'test', 'unittest', 'pydoc', 'tkinter.test', 
    'distutils', 'setuptools', 'PyQt5', 'PyQt6', 'PySide2', 'PySide6',
    'cv2', 'lib2to3', 'adodbapi', 'win32com.gen_py'
]

for pkg in ['customtkinter', 'tkinterdnd2', 'edge_tts']:
    tmp_ret = collect_all(pkg)
    datas += tmp_ret[0]; binaries += tmp_ret[1]; hiddenimports += tmp_ret[2]

# Add custom assets (INCLUDING the bundled bin folder for FFmpeg)
datas += [('assets', 'assets'), ('docs', 'docs'), ('bin', 'bin')]

if sys.platform == 'win32':
    icon_file = 'assets/app_icon.ico' if os.path.exists('assets/app_icon.ico') else 'assets/app_icon.png'
else:
    icon_file = 'assets/app_icon.png' if os.path.exists('assets/app_icon.png') else None

a = Analysis(
    ['main.py', 'gui.py', 'converter.py'],
    pathex=[],
    binaries=binaries,
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=excludes,
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)
pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='AudioLivreur-v0.8.5-Full',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=icon_file,
)
