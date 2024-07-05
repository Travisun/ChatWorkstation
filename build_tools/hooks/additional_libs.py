# hook-black.py
from PyInstaller.utils.hooks import collect_all

datas, binaries, hiddenimports = collect_all('black')

# You can also add any additional hidden imports manually if needed
hiddenimports += ['chromadb']
