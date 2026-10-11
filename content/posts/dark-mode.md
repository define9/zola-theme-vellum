+++
title = "暗色模式不该只是把颜色反过来"
description = "纯黑配纯白在 OLED 上很难读，正确的做法是抬底、降饱和。"
date = 2025-09-14
[extra] 
cover = "/img/covers/dark.svg"
[taxonomies]
tags = ["css", "设计"]
+++

暗色模式的核心不是把 `#000` 塞给背景，而是降低整体亮度对比。

1. 背景用 `#0d1117` 一类，不用纯黑
2. 正文降到 `#c9d1d9`，别用 `#fff`
3. 强调色在暗色下要提亮，否则发灰

```css
:root { color-scheme: light dark; }

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #0d1117;
    --fg: #c9d1d9;
  }
}
```
