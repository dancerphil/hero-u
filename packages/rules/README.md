# @hero-u/rules

English | [中文](https://github.com/dancerphil/hero-u/blob/main/packages/rules/README-zh_CN.md)

https://github.com/user-attachments/assets/707c4735-737b-461b-98c5-1031d525f3c8

### Usage

```
npx @hero-u/rules
```

Alternatively, install globally and then launch:

```
npm i @hero-u/rules -g
rules
```

Visit http://localhost:7788 to manage your AI rules:

- Automatically detect currently installed AI tools
- Scan your codebase for existing rule
- Import existing rules
- Add, edit, and delete your rules
- Assign appropriate rules to all tools and projects, and synchronize

### Model management

Switch to the "Models" page:

- Add OpenAI-compatible endpoints (e.g. OpenRouter, opencode go) and discover models via /v1/models
- Pick the models you want and maintain input/output prices (per 1M tokens)
- Register codebase target files and update their model list source with one click

Configuration is stored in ~/.hero-u/models.
