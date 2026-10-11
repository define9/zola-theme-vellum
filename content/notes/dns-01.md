+++
title = "Cloudflare 证书续期失败"
date = 2026-01-05
+++

`certbot renew` 报 `too many certificates already issued`。是 rate limit，先 `--dry-run` 排错。
