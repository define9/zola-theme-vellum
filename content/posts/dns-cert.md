+++
title = "自建服务的 DNS 与证书自动续期"
description = "一条命令搞定签发与续期，附带 Cloudflare DNS-01 的坑。"
date = 2025-11-02
[extra] 
cover = "/img/covers/net.svg"
[taxonomies]
tags = ["网络", "运维"]
+++

通配符证书用 DNS-01 验证最省心，不依赖 80 端口。

```bash
certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials /etc/letsencrypt/cloudflare.ini \
  -d example.com -d '*.example.com'
```

注意 `cloudflare.ini` 权限给到 600，续期钩子不会替你收紧权限。
