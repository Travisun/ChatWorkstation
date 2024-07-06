import shutil
import os
import argparse


def copy_item(src, dest):
    try:
        if os.path.isfile(src):
            copy_file(src, dest)
        elif os.path.isdir(src):
            copy_folder(src, dest)
        else:
            print(f'Error: {src} is neither a file nor a folder')
    except Exception as e:
        print(f'Error occurred: {e}')


def copy_file(src_file, dest_dir):
    try:
        if not os.path.exists(dest_dir):
            os.makedirs(dest_dir)
        shutil.copy(src_file, dest_dir)
        print(f'File {src_file} copied to {dest_dir}')
    except Exception as e:
        print(f'Error copying file {src_file} to {dest_dir}: {e}')


def copy_folder(src_folder, dest_folder):
    try:
        if os.path.exists(dest_folder):
            shutil.rmtree(dest_folder)
        shutil.copytree(src_folder, dest_folder)
        print(f'Folder {src_folder} copied to {dest_folder}')
    except Exception as e:
        print(f'Error copying folder {src_folder} to {dest_folder}: {e}')


def main():
    parser = argparse.ArgumentParser(description='Copy a file or folder to a specified destination.')
    parser.add_argument('source', type=str, help='The source file or folder to copy.')
    parser.add_argument('destination', type=str, help='The destination directory or folder.')

    args = parser.parse_args()

    copy_item(args.source, args.destination)


if __name__ == '__main__':
    main()
