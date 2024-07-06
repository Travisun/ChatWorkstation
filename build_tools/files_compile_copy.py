import os
import sys
import py_compile
import shutil


def compile_py_files(src, dst):
    if not os.path.exists(dst):
        os.makedirs(dst)

    if os.path.isfile(src):
        if src.endswith('.py'):
            compile_file(src, dst)
    else:
        for root, dirs, files in os.walk(src):
            for file in files:
                if file.endswith('.py'):
                    src_file_path = os.path.join(root, file)
                    relative_path = os.path.relpath(root, src)
                    dst_file_path = os.path.join(dst, relative_path)
                    compile_file(src_file_path, dst_file_path)


def compile_file(src_file, dst_dir):
    if not os.path.exists(dst_dir):
        os.makedirs(dst_dir)
    dst_file = os.path.join(dst_dir, os.path.basename(src_file) + 'c')
    py_compile.compile(src_file, cfile=dst_file)
    print(f"Compiled {src_file} to {dst_file}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python compile_py_files.py <source> <destination>")
        sys.exit(1)

    source = sys.argv[1]
    destination = sys.argv[2]

    compile_py_files(source, destination)
