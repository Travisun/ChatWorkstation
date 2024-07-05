# 这里是打包需要的额外依赖包清单列表

addition_reqirments = [
  "hnswlib",
  "chromadb",
  "pypika",
  "backoff",
  "posthog",
  "passlib",
  "scipy",
  "transformers",
  "pathspec",
  "blib2to3"
  # "chromadb_hnswlib", 需要手动拷贝文件夹和 hnswlib.pyd 文件到安装包的库目录

]
# 额外拷贝文件
# 30fcd23745efe32ce681__mypyc.cp312-win_amd64.pyd
# _black_version.py
# black. 所有文件，需要修复脚本，编译的同时拷贝 .pyd
#


hiddenimports=["black","hnswlib","chromadb","pypika","backoff","posthog","passlib","scipy","transformers","pathspec","blib2to3"],