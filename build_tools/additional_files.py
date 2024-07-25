# 这里是打包需要的额外依赖包清单列表
import platform

additional_libs = [
    "hnswlib",
    "chromadb",
    "pypika",
    "backoff",
    "posthog",
    "passlib",
    "scipy",
    "transformers",
    "pathspec",
    "blib2to3",
    "tokenizers",
    "black"
    # "chromadb_hnswlib", 需要手动拷贝文件夹和 hnswlib.pyd 文件到安装包的库目录

]

file_copies = [
    # windows python3.12
    "30fcd23745efe32ce681__mypyc.cp312-win_amd64.pyd",
    "hnswlib.cp312-win_amd64.pyd",
    "_black_version.py",
    "black",  # 所有文件，需要修复脚本，编译的同时拷贝 .pyd
]
# MacOS 下不会出现依赖丢失问题
# if platform.system() == 'Darwin':
#     file_copies.__delitem__(0)
#     file_copies.__delitem__(1)
# 额外拷贝文件
# black. 所有文件，需要修复脚本，编译的同时拷贝 .pyd
#


# hiddenimports=["black","hnswlib","chromadb","pypika","backoff","posthog","passlib","scipy","transformers","pathspec","blib2to3"],
