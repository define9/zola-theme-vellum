+++
title = "zola serve 不带主题目录"
date = 2025-12-28
+++

`zola serve` 读的是 `theme/` 而非 `themes/`。放错目录时页面会回退到内置模板，看起来「主题没生效」。
