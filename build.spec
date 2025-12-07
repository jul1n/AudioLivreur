# -*- mode: python ; coding: utf-8 -*-
import sys
import os
from PyInstaller.utils.hooks import collect_all

block_cipher = None

# Collect dependencies for CustomTkinter and TkinterDnD2
datas = [
    ('french_flag.png', '.'),
    ('english_flag.png', '.')
]
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

a = Analysis(
    ['gui.py', 'converter.py'],  # Explicitly include converter.py
    pathex=[],
    binaries=binaries,
    datas=datas,
    hiddenimports=hiddenimports + ['converter'],  # Add converter to hidden imports
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
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='AudioLivreur',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,  # Disable UPX to avoid LZMA errors
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon='../images/icon.png' if os.path.exists('../images/icon.png') else None,
    version='version.txt'  # Add version file
)
