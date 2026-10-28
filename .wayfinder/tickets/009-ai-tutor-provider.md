---
title: Which LLM and proxy power the AI tutor?
label: wayfinder:research
status: closed
blocked_by: []
assignee: vivy
---

## Question

The app gets a built-in AI tutor (like cs50.ai's duck) using a **cloud Chinese model behind a tiny proxy** (decided in [What does the in-app API documentation contain?](007-api-docs.md)), because a static site can't hide an API key. Compare Qwen (Alibaba Model Studio / DashScope), DeepSeek, Zhipu GLM, Moonshot Kimi, and any others: free tier and limits, price per 1M tokens after that, reachable from Russia without VPN (both signing up and calling the API), paying from Russia, OpenAI-compatible API, quality on beginner TypeScript help. And the proxy: cheapest serverless host reachable from Russia (Cloudflare Workers, Yandex Cloud Functions, …), how it rate-limits per student without accounts.

## Resolution

- **Model**: DeepSeek V4.1 Flash (OpenAI-compatible). Start on the copy hosted in Yandex AI Studio (rubles, Russian card, ≈ $0.009 per hint). Move to `api.deepseek.com` (≈ 7x cheaper, ≈ $0.0013 per hint) once foreign payment exists: only base URL, key and model name change.
- **Proxy**: a Yandex Cloud Function (domestic, Russian card, 4000 ₽ start grant, free tier ≈ 57k calls a month). Not Cloudflare Workers: Russian ISPs throttle Cloudflare since June 2025.
- **Abuse limits, no accounts**: the proxy accepts only `{lessonId, code, question}` and builds the prompt itself; caps input size and `max_tokens`; daily counters in YDB per anonymous browser ID (UUID in localStorage) and per IP (looser, schools share IPs); a global daily token budget answers "resting, try tomorrow"; SmartCaptcha only if abuse appears.
- Free tiers (GLM Flash, OpenRouter, Groq) suit development only: all students share one key. Gemini, OpenAI, Anthropic don't serve Russia.
- **Open caveats**: hint quality isn't benchmarked (hand-grade ~20 real student mistakes on DeepSeek Flash vs Qwen3.6 35B before locking in); exact Yandex model id for DeepSeek unchecked.

Details and sources: [research/ai-tutor-provider.md](../research/ai-tutor-provider.md)

Later: for the MVP the user chose a free **Ask DeepSeek** copy-and-open button instead; this paid plan is out of scope until a built-in tutor is wanted.
