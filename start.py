import logging
import os
import random
import sys
import traceback

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


# 修复不规范的代理软件带来的错误
def ensure_proxy_protocol():
    # 常见的代理环境变量
    proxy_env_vars = [
        "http_proxy",
        "https_proxy",
        "HTTP_PROXY",
        "HTTPS_PROXY"
    ]

    http_proxy_enabled = os.getenv('HTTP_PROXY_ENABLED', 'false').lower()
    http_proxy_url = os.getenv('HTTP_PROXY_URL', '')

    if http_proxy_enabled == 'true':
        if not http_proxy_url:
            logging.info('HTTP_PROXY_ENABLED=true but HTTP_PROXY_URL is not set, will use system proxy settings.')
            return
        else:
            os.environ.update((var, http_proxy_url) for var in proxy_env_vars)
            logging.info("Set all proxy variables to {}".format(http_proxy_url))
    elif http_proxy_enabled == 'false':
        for var in proxy_env_vars:
            os.environ.pop("NO_PROXY", True)
            os.environ.pop(var, None)
        logging.info("Cleared all proxy variables")

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)

    print(f"Check .env file setting: {os.environ.get('OLLAMA_BASE_URL', 'error loading .env')}")

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
    # Set up signal handling
    try:
        # Loading .env
        load_env_setting()
        # Correct proxy setting protocols
        ensure_proxy_protocol()
        # Check uvicorn
        ensure_uvicorn_installed()
        # Running main
        main()
    except ModuleNotFoundError as err:
        print("Need module to be installed:", err)
    except KeyboardInterrupt:
        print("Program interrupted")
    except BaseException as e:
        print(f"Backend Service Errors: {e}")
        # 捕获异常并打印详细的错误信息
        print("An error occurred:")
        traceback.print_exc()
        print("\nDetailed error information:")
        print("Exception type:", type(e))
        print("Exception message:", e)
        print("Traceback details:", traceback.format_exc())
