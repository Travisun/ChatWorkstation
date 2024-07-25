import logging
import os
import shutil
import py_compile


def setup_logging():
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    return logger

logger  = setup_logging()

def find_file(filename, search_paths, max_depth=5):
    for path in search_paths:
        for root, dirs, files in os.walk(path):
            if filename in files or filename in dirs:
                return os.path.join(root, filename)
            if root.count(os.sep) - path.count(os.sep) >= max_depth:
                del dirs[:]  # Do not recurse further down this path
    return None


def process_file(file_path, dest_folder):
    try:
        if file_path.endswith('.py'):
            compiled_file = py_compile.compile(file_path, cfile=file_path + 'c')
            dest_path = os.path.join(dest_folder, os.path.basename(compiled_file))
            shutil.copy2(compiled_file, dest_path)
        else:
            dest_path = os.path.join(dest_folder, os.path.basename(file_path))
            shutil.copy2(file_path, dest_path)
    except Exception:
        logger.info(f"File Error: {file_path}")


def process_folder(folder_path, dest_folder):
    for root, dirs, files in os.walk(folder_path):
        rel_path = os.path.relpath(root, folder_path)
        dest_path = os.path.join(dest_folder, rel_path)
        os.makedirs(dest_path, exist_ok=True)
        for file in files:
            file_path = os.path.join(root, file)
            if file.endswith('.py'):
                process_file(file_path, dest_path)
            else:
                shutil.copy(file_path, dest_path)


def main(filenames, target_folder, search_paths):
    os.makedirs(target_folder, exist_ok=True)
    for filename in filenames:
        file_path = find_file(filename, search_paths)
        if file_path:
            if os.path.isdir(file_path):
                process_folder(file_path, os.path.join(target_folder, filename))
            elif os.path.isfile(file_path):
                process_file(file_path, target_folder)
        else:
            print(f"File or folder {filename} not found.")


if __name__ == "__main__":
    from additional_files import file_copies

    filenames = file_copies

    script_path = os.path.dirname(os.path.abspath(__file__))
    target_folder = os.path.join(script_path, "../", "dist", "ChatWorkstation", "_internal")
    search_paths = os.environ['PATH'].split(os.pathsep) + [os.getcwd()]

    main(filenames, target_folder, search_paths)
