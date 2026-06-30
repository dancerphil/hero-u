# @hero-u/hermes

hero-u 的个人助手，支持**微信**和**飞书**两种渠道，由 AI 驱动并可联网搜索。核心能力是**定时任务（cron）的增删改查**；到点由 AI 根据任务生成提醒内容发回给你。

## 安装

```bash
npm i -g @hero-u/hermes
```

## 使用

```bash
hero-hermes setup   # 交互式配置：填写 API Key、微信扫码登录、飞书应用凭据（可反复运行）
hero-hermes start   # 监听微信和飞书消息，管理并触发定时任务
```

记忆存储于 `~/.hero-u/`
