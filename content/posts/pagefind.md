+++
title = "Pagefind 全站搜索接入笔记"
description = "构建后跑一次索引命令，得到一个不需要后端的搜索。"
date = 2025-07-30
[extra] 
cover = "/img/covers/note.svg"
[taxonomies]
tags = ["zola", "搜索"]
+++

```bash
zola build
pagefind --site public
```

索引是静态的，别在本地开发时用 `--minify`，压缩器会把属性引号去掉，Pagefind 解析不了。
