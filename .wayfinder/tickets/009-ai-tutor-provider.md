---
title: Which LLM and proxy power the AI tutor?
label: wayfinder:research
status: open
blocked_by: []
assignee:
---

## Question

The app gets a built-in AI tutor (like cs50.ai's duck) using a **cloud Chinese model behind a tiny proxy** (decided in [What does the in-app API documentation contain?](007-api-docs.md)), because a static site can't hide an API key. Compare Qwen (Alibaba Model Studio / DashScope), DeepSeek, Zhipu GLM, Moonshot Kimi, and any others: free tier and limits, price per 1M tokens after that, reachable from Russia without VPN (both signing up and calling the API), paying from Russia, OpenAI-compatible API, quality on beginner TypeScript help. And the proxy: cheapest serverless host reachable from Russia (Cloudflare Workers, Yandex Cloud Functions, …), how it rate-limits per student without accounts.
