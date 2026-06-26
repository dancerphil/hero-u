# @hero-u/hermes

hero-u 的微信助手。连接个人微信（基于腾讯 iLink Bot API，参考 hermes-agent），由 OpenRouter 上的 `deepseek-v4-flash:online`（`:online` 自带联网搜索）驱动。核心能力是**定时任务（cron）的增删改查**；到点由 AI 根据任务生成提醒内容发回给你。普通问答也照常用 AI 回答，但会顺带提醒你：单纯的检索/问答更建议直接用 DeepSeek 网页端（chat.deepseek.com）——cron 才是这个助手的主要价值。

## 安装

```bash
npm i -g @hero-u/hermes
```

## 使用

```bash
hero-hermes setup   # 交互式配置：询问 OPENROUTER_API_KEY、生成二维码扫码登录（可反复运行）
hero-hermes start   # 监听微信消息，管理并触发定时任务
```

`setup` 会把缺失的 `OPENROUTER_API_KEY` 问出来写入 `~/.hero-u/.env`，并在未登录时把二维码图片存到 `~/.hero-u/weixin-login.png` 让你扫码。已配置的项会跳过，可随时重复运行（也用来再登录一个微信账号）。

直接给机器人发消息来管理定时任务，例如：

- 「每天早上 8 点提醒我喝水」 → 创建（到点 AI 生成提醒发回）
- 「我有哪些提醒」 → 列出（含 id）
- 「把喝水那条改成 9 点」 → 修改
- 「删掉喝水提醒」 → 删除

普通问题它也会回答，但会建议你纯检索类直接用 DeepSeek 网页端，并引导你多用定时任务。

## 文件布局（`~/.hero-u/`）

- `.env` — `OPENROUTER_API_KEY`
- `weixin/accounts/<id>.json` — 微信账号凭据
- `weixin/accounts/<id>.sync.json` — 长轮询游标
- `weixin/accounts/<id>.context.json` — 每个会话的 context token
- `cron.json` — 定时任务
