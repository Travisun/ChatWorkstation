#
# Chat Workstation Builder Script
# For Apple MacOS
# Python 3.11
# Author: Travis Tang
# Homepage: https://www.evzs.com
# Date: 2024-07-25
#

# Activate virtual env
source venv/bin/activate
# Build UI Static Files
# Pyodide:fetch
# shellcheck disable=SC2164
cd third_party/open_webui
node scripts/prepare-pyodide.js
npm run build
cd ../../

# Build Backend Service
pyinstaller start.spec
python build_tools/file_copy.py .env dist/ChatWorkstation/
# Additional Libs
python build_tools/files_compile_copy.py third_party/open_webui/backend/apps/webui/internal dist/ChatWorkstation/_internal/apps/webui/internal
python build_tools/files_compile_copy.py third_party/open_webui/backend/static/fonts dist/ChatWorkstation/_internal/static/fonts
# Additional Compiled Libs
python build_tools/lib_compiler.py
python build_tools/lib_copy.py

# Copy UI Files
python build_tools/file_copy.py third_party/open_webui/build dist/ChatWorkstation/Build
python build_tools/file_copy.py third_party/open_webui/static dist/ChatWorkstation/_internal/static

# Electron Pack
cd src/app
npm run electron-pack
