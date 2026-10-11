+++
title = "用 Zola 搭一个自己的主题"
description = "从 zola init 到 theme.toml，把一套可发布的模板拆成用户可覆盖的片段。"
date = 2026-01-08
[extra] 
cover = "/img/covers/zola.svg"
featured = true
[taxonomies]
tags = ["zola", "设计"]
+++

Zola 的主题本质就是一个能独立 `zola serve` 的站点，多一份 `theme.toml`。
把硬编码的东西收进 `config.extra`，模板就变成了配置驱动的。

## 从 zola init 开始

```bash
zola init my-theme
cd my-theme && zola serve
```

## 模板要留哪些口子

- 站点级：标题、描述、社交链接、默认 section
- 页面级：`cover`、`description`、`featured`、`comments = false`
- 文案级：导航项、按钮文字，全部走 `config.extra`

这样用户只改 `zola.toml`，永远不用碰 `templates/`。

> 引用块、代码块、表格的样式应该跟内容宽度解耦，正文栏和侧栏各自独立。
