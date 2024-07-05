import os
import sys
import compileall
import shutil
import importlib.util
import pkgutil
import logging
from colorama import init, Fore, Style
from pathlib import Path

# 初始化 colorama
init(autoreset=True)

def setup_logging():
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    return logger

def custom_compile_file(file_path, base_dir, output_dir, logger):
    try:
        # 编译单个文件
        success = compileall.compile_file(file_path, force=True, legacy=True, quiet=1)
        if success:
            # 获取编译后的 .pyc 文件路径
            compiled_file_path = Path(file_path).with_suffix('.pyc')
            # 构建目标路径，保持目录结构
            rel_path = os.path.relpath(file_path, base_dir)
            dest_path = os.path.join(output_dir, rel_path)
            dest_path = Path(dest_path).with_suffix('.pyc')
            dest_dir = os.path.dirname(dest_path)
            if not os.path.exists(dest_dir):
                os.makedirs(dest_dir)
            # 移动 .pyc 文件到目标路径
            shutil.move(str(compiled_file_path), str(dest_path))
            logger.info(f"{Fore.GREEN}Successfully compiled and moved file: {file_path} -> {dest_path}")
        else:
            logger.error(f"{Fore.RED}Failed to compile file: {file_path}")
    except Exception as e:
        logger.error(f"{Fore.RED}Error compiling file: {file_path} - {str(e)}")

def copy_non_py_files(src_dir, dest_dir, logger):
    for root, _, files in os.walk(src_dir):
        if 'test' in root.split(os.sep) or 'unittest' in root.split(os.sep):
            continue
        for file in files:
            if not file.endswith(".py"):
                src_file_path = os.path.join(root, file)
                rel_path = os.path.relpath(src_file_path, src_dir)
                dest_file_path = os.path.join(dest_dir, rel_path)
                dest_file_dir = os.path.dirname(dest_file_path)
                if not os.path.exists(dest_file_dir):
                    os.makedirs(dest_file_dir)
                shutil.copy2(src_file_path, dest_file_path)
                logger.info(f"{Fore.GREEN}Copied non-Python file: {src_file_path} -> {dest_file_path}")

def custom_compile_dir(dir_path, base_dir, output_dir, logger):
    for root, _, files in os.walk(dir_path):
        if 'test' in root.split(os.sep) or 'unittest' in root.split(os.sep):
            logger.info(f"{Fore.YELLOW}Ignoring directory: {root}")
            continue
        for file in files:
            if file.endswith(".py"):
                file_path = os.path.join(root, file)
                custom_compile_file(file_path, base_dir, output_dir, logger)
            else:
                src_file_path = os.path.join(root, file)
                rel_path = os.path.relpath(src_file_path, base_dir)
                dest_file_path = os.path.join(output_dir, rel_path)
                dest_dir = os.path.dirname(dest_file_path)
                if not os.path.exists(dest_dir):
                    os.makedirs(dest_dir)
                shutil.copy2(src_file_path, dest_file_path)
                logger.info(f"{Fore.GREEN}Copied non-Python file: {src_file_path} -> {dest_file_path}")

def compile_module(module_name, output_dir, logger):
    # 获取模块的文件路径
    module_spec = importlib.util.find_spec(module_name)
    if module_spec is None:
        logger.error(f"{Fore.RED}Module {module_name} not found.")
        return

    module_path = module_spec.origin
    module_dir = os.path.dirname(module_path)

    # 检查模块是否是 .pyd 文件
    if module_path.endswith('.pyd'):
        rel_path = os.path.relpath(module_path, sys.prefix)
        dest_path = os.path.join(output_dir, rel_path)
        dest_dir = os.path.dirname(dest_path)
        if not os.path.exists(dest_dir):
            os.makedirs(dest_dir)
        shutil.copy2(module_path, dest_path)
        logger.info(f"{Fore.GREEN}Copied .pyd file: {module_path} -> {dest_path}")
        return

    # 获取运行环境的根目录
    env_root = sys.prefix

    # 编译模块目录及其子目录中的所有文件
    custom_compile_dir(module_dir, env_root, output_dir, logger)

    # 递归编译所有依赖的包
    def onerror(name):
        logger.warning(f"{Fore.YELLOW}Error importing module: {name}. Skipping...")

    for _, submodule_name, is_pkg in pkgutil.walk_packages([module_dir], prefix=module_name+'.', onerror=onerror):
        submodule_full_name = f"{module_name}.{submodule_name}"
        try:
            submodule_spec = importlib.util.find_spec(submodule_full_name)
            if submodule_spec:
                submodule_path = submodule_spec.origin
                submodule_dir = os.path.dirname(submodule_path)
                custom_compile_dir(submodule_dir, env_root, output_dir, logger)
        except Exception as e:
            logger.warning(f"{Fore.YELLOW}Error importing module: {submodule_full_name}. Skipping... {e}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(f"{Fore.RED}Usage: python compile_script.py <module_names_comma_separated> <output_dir>")
        sys.exit(1)

    module_names = sys.argv[1].split(',')
    output_dir = sys.argv[2]

    logger = setup_logging()

    for module_name in module_names:
        module_name = module_name.strip()
        logger.info(f"{Fore.BLUE}Compiling module: {module_name}")
        compile_module(module_name, output_dir, logger)

    print(f"{Fore.GREEN}Compiled files are saved to {output_dir}")
