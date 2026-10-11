+++
title = "用 CSS 网格重排博客首页"
description = "没有封面图的旧文章，也能靠排版救回来。"
date = 2025-05-21
[extra]
[taxonomies]
tags = ["css", "设计"]
+++

给没图的老文章留一张默认封面，卡片高度就不会跳。

```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 32px;
}
```
