import os
import random
import sys

import uvicorn
from importlib.util import find_spec

from dotenv import load_dotenv

# 脚本主目录
base_script_path = os.path.dirname(os.path.abspath(__file__))
# 开发时的库目录
backend_path = os.path.join(base_script_path, "third_party", "open_webui", "backend")
# 编译后的目录
runtime_path = os.path.join(base_script_path, "_internal")
# 添加额外目录到 Path
sys.path.append(base_script_path)
sys.path.append(backend_path)
sys.path.append(runtime_path)

print("Path: {}".format(sys.path))

def generate_secret_key(length=12):
    return ''.join(str(random.randint(0, 9)) for _ in range(length))

def ensure_uvicorn_installed():
    if find_spec('uvicorn') is None:
        print("uvicorn is not installed. Installing...")
        import pip
        pip.main(['install', 'uvicorn'])
        print("uvicorn installed successfully.")

def load_env_setting():
    # 获取当前脚本所在的目录
    current_directory = os.path.dirname(os.path.abspath(__file__))

    # 拼接 .env 文件的路径
    env_path = os.path.join(current_directory, '.env')

    # 加载 .env 文件中的参数到环境变量
    load_dotenv(dotenv_path=env_path)
    # 现在你可以访问 .env 文件中的环境变量了

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)

    print(f"Check .env file setting: {os.environ.get("OLLAMA_BASE_URL", "error loading .env")}")

    key_file = '.webui_secret_key'
    port = int(os.getenv('PORT', '8080'))
    host = os.getenv('HOST', '0.0.0.0')
    webui_secret_key = os.getenv('WEBUI_SECRET_KEY')
    webui_jwt_secret_key = os.getenv('WEBUI_JWT_SECRET_KEY')

    if not webui_secret_key and not webui_jwt_secret_key:
        print("Loading WEBUI_SECRET_KEY from file, not provided as an environment variable.")

        if not os.path.exists(key_file):
            print("Generating WEBUI_SECRET_KEY")
            webui_secret_key = generate_secret_key()
            with open(key_file, 'w') as f:
                f.write(webui_secret_key)
            print("WEBUI_SECRET_KEY generated")

        print(f"Loading WEBUI_SECRET_KEY from {key_file}")
        with open(key_file, 'r') as f:
            webui_secret_key = f.read().strip()

    os.environ['WEBUI_SECRET_KEY'] = webui_secret_key
    from third_party.open_webui.backend.main import app
    uvicorn.run(app, host=host, port=port, forwarded_allow_ips='*')

if __name__ == '__main__':
    try:
        # Loading .env
        load_env_setting()
        # Check uvicorn
        ensure_uvicorn_installed()
        # Running main
        main()
    except ModuleNotFoundError as err:
        print("Need module to be installed:", err)
