# V2Ray Worker
通过 Cloudflare Workers 配置 V2Ray 的一站式解决方案

[English version](https://github.com/vfarid/v2ray-worker/blob/main/README.md)
[نسخه فارسی](https://github.com/vfarid/v2ray-worker/blob/main/README-fa.md)

## 如何使用

待补充……

## 部署
1. 复刻这个仓库并启用 Github Action
2. 进入 [Cloudflare 仪表板](https://dash.cloudflare.com)，在“存储和数据库 / KV”下创建命名空间 `v2ray_worker_settings`，并复制其 ID
3. 进入复刻的仓库，在“Settings / Secrets and variables / Actions”中设置新的 secret，名称为 `V2RAY_WORKER_KV_ID`，值为上一步复制的 KV `v2ray_worker_settings` ID
4. 修改 `README.md`，找到下方的按钮，将最后的 url 修改为你自己复刻的仓库链接 `https://github.com/USER/REPO_NAME` 并保存
5. 点击 `Deploy With Workers`，跟随指引进行配置

### Credits
Built-in vless config generator is based on [Zizifn Edge Tunnel](https://github.com/zizifn/edgetunnel), re-written using Typescript.
Built-in trojan config generator is based on [ca110us/epeius](https://github.com/ca110us/epeius/tree/main), re-written using Typescript.
Proxy IPs source: https://rentry.co/CF-proxyIP
