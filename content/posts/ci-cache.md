+++
title = "让 CI 快三倍：依赖缓存与并行拆分"
description = "缓存 key 设计错一次，构建时间从 6 分钟涨到 14 分钟。"
date = 2025-12-19
[extra] 
cover = "/img/covers/ci.svg"
[taxonomies]
tags = ["ci", "性能"]
+++

缓存 key 里带了 commit hash，等于没缓存。

## 有效的分层

```yaml
# 只在 lock 文件变化时失效
- uses: actions/cache@v4
  with:
    path: target
    key: cargo-${{ hashFiles('Cargo.lock') }}
```

## 拆分矩阵

- lint 与 test 并行
- test 按 crate 分片
- 覆盖率合并后再上传
