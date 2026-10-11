# Vellum

大图卡片 + 极简留白的 Zola 博客主题。界面文案中文，内置明暗切换、阅读进度、目录、
Pagefind 搜索、友链页、便签流与 giscus 评论。

- 主题：`theme.toml`
- 演示站：仓库根目录的 `zola.toml` + `content/`（`zola serve` 直接跑起来就是本站预览）
- 依赖：Zola **0.23+**（用到了 `paginator`、`get_taxonomy()`、frontmatter `[extra]` 等 0.23 API）

## 安装

```bash
git submodule add https://github.com/define9/zola-theme-vellum themes/vellum
```

在 `zola.toml` 顶部加（Zola 会自动补 `themes/` 前缀，所以写 `vellum` 而不是 `themes/vellum`）：

```toml
theme = "vellum"
compile_sass = true

# 正文里常有 ${{ ... }}（CI 配置）这类 Tera 语法，建议关掉正文模板化
skip_content_templating = ["**/*.md"]
```

搜索需要额外生成一次索引（见下文）。

## 功能

| 页面 | 模板 | 说明 |
| --- | --- | --- |
| 首页 | `index.html` | 大图头条卡 + 卡片网格，取 `extra.default_section` 里最新的 N 篇 |
| 文章列表 | `section.html` | section 列表页，配 `paginate_by` 自动分页 |
| 文章 / 页面 | `page.html` | 窄栏正文 + 右侧目录、上下篇、评论 |
| 分类（标签） | `taxonomy_list.html` / `taxonomy_single.html` | 标签云与标签下的文章 |
| 归档 | `archive.html` | 按年份分组 |
| 便签 | `notes.html` | 时间线式短内容 |
| 友链 | `friends.html` | frontmatter 里的 `[[extra.friends]]` |
| 搜索 | `search.html` | Pagefind 静态索引 |
| 404 | `404.html` | — |

其它：明暗切换（记住偏好、默认跟随系统）、阅读进度条、代码块语言标签与一键复制、
目录滚动高亮、回到顶部、外链自动 `target="_blank"`、RSS / sitemap / robots.txt / SEO meta。

## 配置

站点级，全部写在 `zola.toml` 的 `[extra]`：

```toml
[extra]
default_section = "posts"   # 首页卡片取哪个 section，必须真实存在；留空则首页只留 hero
home_posts = 12              # 首页最多显示几篇
taxonomy = "tags"            # 分类名，默认 tags
home_title = "首页"
since = 2020
footer_license = "CC BY-NC-SA 4.0"
footer_note = "本站由 Vellum 驱动"
favicon = "/img/favicon.svg"
avatar = "/img/avatar.svg"

# 页脚社交链接，只有 http(s) 开头的才渲染
[extra.social]
github = "https://github.com/define9"

# giscus 评论：四个字段填齐即开启
[extra.giscus]
repo = "define9/define9.github.io"
repo_id = "R_kgDOU8dogA"
category = "General"
category_id = "DIC_kwDOU8dogM4DHiMa"
mapping = "pathname"
```

界面文案也在 `[extra]` 里，全部可覆盖：

```toml
[extra]
minutes = "分钟阅读"
toc_title = "目录"
tag_label = "标签"
search_placeholder = "搜索文章…"
# ... 见 theme.toml [extra]
```

### 导航

导航项写在 `static/data/nav.toml`，删条目即隐藏，不用改模板：

```toml
[[nav]]
title = "首页"
path = "/"

[[nav]]
title = "文章"
path = "/posts/"
```

### 搜索

```bash
zola build
pagefind --site public
```

**不要加 `--minify`**：Zola 的压缩器会去掉属性引号，Pagefind 解析不了。

### 正文 frontmatter

Zola 0.23 起，自定义字段要放进显式的 `[extra]` 表，标签放 `[taxonomies]`：

```toml
+++
title = "文章标题"
description = "列表页摘要"
date = 2026-01-08

[extra]
cover = "/img/covers/demo.svg"   # 封面；缺省用 /img/covers/default.svg
featured = true                   # 预留字段，首页头条取最新一篇
comments = false                  # 关掉这篇的评论
note = "侧栏补充说明"              # 渲染在目录下方

[taxonomies]
tags = ["zola", "设计"]
+++
```

### 便签与友链

便签 = 一个 section，frontmatter 里 `template = "notes.html"`。

```toml
+++
title = "便签"
template = "notes.html"
sort_by = "date"
+++
```

友链页 frontmatter：

```toml
+++
title = "友情链接"
template = "friends.html"

[[extra.friends]]
name = "站点名"
url = "https://example.com"
desc = "一句话介绍"
avatar = "/img/avatar.png"   # 可选
+++
```

### 中文 URL

中文标签默认会被 slugify 转成拼音，想保留中文：

```toml
[slugify]
taxonomies = "off"
```

## 目录结构

```
templates/        模板与 partials
sass/             main.scss + 分片（改配色看 _tokens.scss）
static/           js / img / data/nav.toml
content/          演示内容
theme.toml        主题元信息与默认配置
```

## 覆盖样式

Zola 编译站点自己的 `sass/main.scss`（同名文件会覆盖主题的）。想换配色，把主题的 sass
分片复制到自己站点里再改：

```bash
cp themes/vellum/sass/*.scss sass/
$EDITOR sass/_tokens.scss   # 改 --accent / --bg / 圆角等
```

只要改颜色的话，也可以不改主题文件，直接在页面底部追加一小段 CSS。

## 许可

MIT
