# -*- mode: python ; coding: utf-8 -*-
import sys
import os
from PyInstaller.utils.hooks import collect_all

block_cipher = None

# Collect dependencies for CustomTkinter and TkinterDnD2
datas = []
binaries = []
hiddenimports = ['customtkinter', 'tkinterdnd2', 'PIL', 'edge_tts', 'ebooklib', 'bs4']

# Collect CustomTkinter assets
tmp_ret = collect_all('customtkinter')
datas += tmp_ret[0]; binaries += tmp_ret[1]; hiddenimports += tmp_ret[2]

# Collect TkinterDnD2 assets
tmp_ret = collect_all('tkinterdnd2')
datas += tmp_ret[0]; binaries += tmp_ret[1]; hiddenimports += tmp_ret[2]

# Collect edge-tts assets (if any)
tmp_ret = collect_all('edge_tts')
datas += tmp_ret[0]; binaries += tmp_ret[1]; hiddenimports += tmp_ret[2]

# Add custom assets
datas += [('assets', 'assets'), ('docs', 'docs')]

# Determine Icon
icon_file = None
if os.path.exists('assets/app_icon.png'):
    icon_file = 'assets/app_icon.png'
elif os.path.exists('../images/icon.png'):
    icon_file = '../images/icon.png'

# Mac specific adjustments
if sys.platform == 'darwin':
    pass

a = Analysis(
    ['gui.py', 'converter.py'],
    pathex=[],
    binaries=binaries,
    datas=datas,
    hiddenimports=hiddenimports + ['converter'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)
pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='AudioLivreur',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=icon_file,
    version='assets/version.txt' if os.path.exists('assets/version.txt') else None
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=False,
    upx_exclude=[],
    name='AudioLivreur',
)

if sys.platform == 'darwin':
    app = BUNDLE(
        coll,
        name='AudioLivreur.app',
        icon=icon_file,
        bundle_identifier='com.julien.audiolivreur',
        version='0.3.3'
    )
