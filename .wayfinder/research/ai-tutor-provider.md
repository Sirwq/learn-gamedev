# Which LLM and proxy power the AI tutor?

Researched 2026-10-29. Ticket: [009](../tickets/009-ai-tutor-provider.md).

## TL;DR

- **LLM: DeepSeek V4.1 Flash**, the cheapest strong coding model on the list and OpenAI-compatible. Start with the copy **hosted in Yandex AI Studio**, which you pay in rubles on the same bill as the proxy. Move to **`api.deepseek.com` directly** (about 7x cheaper) once you have a way to pay in foreign currency. Both are OpenAI-compatible, so switching means changing the base URL, key and model name.
- **Proxy: Yandex Cloud Function.** It is reachable from Russia (domestic cloud), you pay with a Russian card, and you get a 4000 ₽ / 60-day start grant. The free tier is 1M calls and 10 GB-hours a month, which is about 57k five-second LLM calls at 128 MB. **Avoid Cloudflare Workers.** Russian ISPs have throttled Cloudflare to ~16 KB per connection since June 2025, and Cloudflare confirmed it.
- **Rate limit (no accounts):**
  1. The proxy accepts only `{lessonId, code, question}` and builds the prompt itself, so it is useless as a free general-purpose LLM.
  2. It caps `max_tokens` and input size.
  3. It keeps daily counters in YDB serverless: per anonymous browser ID (a UUID in `localStorage`) and per IP, with a looser IP cap because whole schools share one IP.
  4. A **global daily token budget** makes the tutor reply "resting, try tomorrow" once it is hit.
  5. A prepaid balance (DeepSeek) or budget alert (Yandex) catches the worst case.
  6. Add Yandex SmartCaptcha (10k free checks a month) to mint a short-lived signed token only if abuse shows up.
- **Cost per hint** (≈3k input + 300 output tokens): DeepSeek direct ≈ **$0.0013** at peak hours, Yandex-hosted ≈ **$0.009**. 500 hints a day comes to roughly $0.65 or $4.30 a day.

## 1. LLM providers

Prices are USD per 1M tokens (input / output) for the cheapest model that is good enough, from official pages read 2026-10-29.

| Provider | Cheapest suitable model | Price in / out | Free tier | Works from Russia, no VPN | Pay from Russia | OpenAI-compatible |
|---|---|---|---|---|---|---|
| **DeepSeek** | `deepseek-flash` (V4.1-Flash-1017) | $0.30 / $1.20 peak, **$0.15 / $0.60 off-peak**, cache hit $0.006 | None listed | Yes, widely used in RU (not officially stated) | **Hard**: Russian cards reported declined. Channels are PayPal, card, Alipay, WeChat; use a foreign card or reseller | Yes |
| **Yandex AI Studio** (hosts DeepSeek, Qwen, gpt-oss) | DeepSeek-V4.1-Flash; Qwen3.6 35B; gpt-oss-20b | $2.46 / $4.10; $1.64 / $2.46; $0.82 / $0.82 | Only the general 4000 ₽ cloud grant | **Yes** (domestic) | **Yes**, rubles, Russian card | Yes (`llm.api.cloud.yandex.net/v1`) |
| **Qwen** (Model Studio, Singapore) | `qwen-flash`; `qwen3.8-flash` | $0.05 / $0.40; $0.15 / $0.47 | 1M tokens per model, 90 days, Singapore region only | Not confirmed | Not confirmed; Alibaba Cloud intl needs a card, Russian cards almost certainly fail | Yes |
| **Zhipu GLM** (z.ai) | `GLM-4.7-Flash` (free); `GLM-4.7-FlashX` | **Free**; $0.07 / $0.40 | Free Flash models, reportedly **1 concurrent request** | chat.z.ai works without VPN (Jul 2026); API not confirmed | Russian cards don't work; RU resellers (e.g. AITUNNEL, from 500 ₽) | Yes |
| **Moonshot Kimi** | K3 (K2 is being retired by end of Dec 2026) | $3.00 / $15.00 | None | Not checked | Not checked | Yes |
| **OpenRouter** `:free` models | various | Free | 20 RPM; 50 req/day (1000/day after buying $10 of credits) per account, shared by all students | Not confirmed | Not checked | Yes |
| **Groq** | gpt-oss-20b, qwen3.8-27b | free tier | 30 RPM, 1K RPD, 200K tokens/day | Not confirmed; Groq geo-blocks some countries (China reported) | Not checked | Yes |
| **Gemini** | - | - | - | **No**: Russia is not on the available-regions list (updated 2026-10-22) | - | - |
| OpenAI / Anthropic | - | - | - | No, Russia is unsupported (well known; not re-checked) | - | - |

Notes:

- DeepSeek off-peak is every hour except 01:00–04:00 and 06:00–10:00 UTC on weekdays. Those peak hours are 04:00–07:00 and 09:00–13:00 Moscow time, which overlaps with school hours. Budget at peak prices.
- The free tiers (GLM Flash, OpenRouter, Groq) are per account, and **every student shares one key**. One concurrent request or 50 requests a day breaks with a single class. They work for development, not for production.
- **Quality on beginner TypeScript.** No primary benchmark covers "hints for beginners". DeepSeek V4.x, Qwen3.x and GLM-4.7+ are all sold as strong coding models, and any of them can explain a TS error to a beginner. The "hint, not solution" behaviour depends on the system prompt more than the model. Before locking in, run 20 real student mistakes through the top two candidates (DeepSeek Flash, Qwen3.6 35B) and grade the hints by hand. Russian-language answers matter too, and both handle Russian.

Sources:
- DeepSeek pricing: <https://api-docs.deepseek.com/quick_start/pricing>
- Paying DeepSeek from Russia (secondary): <https://companies.rbc.ru/news/0Su2q3GJoP/kak-oplatit-deepseek-api-iz-rossii-v-2026-godu-popolnenie-balansa/>, <https://vc.ru/services/3040760-oplata-deepseek-iz-rossii>
- Yandex AI Studio pricing: <https://aistudio.yandex.ru/docs/en/ai-studio/pricing>
- Yandex AI Studio OpenAI compatibility: <https://yandex.cloud/en/docs/ai-studio/concepts/openai-compatibility>
- Qwen prices: <https://www.alibabacloud.com/help/en/model-studio/model-pricing>
- Qwen free quota: <https://www.alibabacloud.com/help/en/model-studio/new-free-quota>
- z.ai pricing: <https://docs.z.ai/guides/overview/pricing>
- z.ai from Russia (secondary, 2026-07): <https://kod.ru/glm-chat-z-ai-vozmozhnosti-registratsiya-blokirovki>
- GLM free concurrency (secondary): <https://toolnavs.com/en/article/1100-zai-released-glm-47-flash-weights-and-api-free-tier-1-concurrency-and-launched-f>
- Kimi: <https://platform.kimi.ai/docs/pricing/chat> (tables did not render; K2 retirement note), <https://www.kimi.ai/resources/kimi-k3-pricing> ($3 / $15)
- OpenRouter limits: <https://openrouter.ai/docs/api-reference/limits>
- Groq limits: <https://console.groq.com/docs/rate-limits>
- Gemini regions: <https://ai.google.dev/gemini-api/docs/available-regions>

## 2. Proxy host

| Host | Free tier | Reachable from Russia | Developer pays from Russia | Counters for rate limits |
|---|---|---|---|---|
| **Yandex Cloud Functions** | 1M invocations + 10 GB-h per month; then $0.155/M calls, $0.053/GB-h | **Yes** (domestic) | **Yes**, Russian card; 4000 ₽ start grant for 60 days | YDB serverless (monthly free package), Lockbox for the key, SmartCaptcha |
| Cloudflare Workers | 100k requests/day, 10 ms CPU; KV 100k reads / 1k writes per day; Durable Objects 100k requests/day | **Throttled**: ISPs cap Cloudflare at ~16 KB per connection since 2025-06-09, confirmed by Cloudflare. A user report also says `workers.dev` stopped responding | International card only | Rate-limit binding (10 s / 60 s windows, per location, approximate), KV, Durable Objects |
| Vercel / Deno Deploy | not checked in detail (Vercel Hobby is non-commercial) | Risky: the same throttling has been reported for other foreign hosts (Hetzner, DigitalOcean, OVH) | International card only | External KV |

The GB-hour maths: an LLM call is mostly waiting, about 5 s at 128 MB, which is 0.125 GB × 5/3600 ≈ 0.00017 GB-h. So 10 GB-h ≈ 57k calls a month free. The GB-hours run out before the 1M call quota does. Streaming makes the function run longer, so keep hints short.

Sources:
- Yandex Cloud Functions pricing: <https://yandex.cloud/en/docs/functions/pricing>
- Yandex start grant: <https://yandex.cloud/ru/all-offers>, <https://yandex.cloud/ru/docs/getting-started/usage-grant>
- SmartCaptcha pricing: <https://yandex.cloud/en/docs/smartcaptcha/pricing>
- YDB serverless pricing: <https://yandex.cloud/en/docs/ydb/pricing/serverless>
- Cloudflare Workers pricing: <https://developers.cloudflare.com/workers/platform/pricing/>
- Cloudflare rate-limit binding: <https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/>
- 16 KB throttling: <https://en.zona.media/article/2025/06/27/cloud_confirmed>, <https://www.heise.de/en/news/The-16-Kbyte-trick-Russian-providers-block-foreign-content-again-10465087.html>
- `workers.dev` user report: <https://ntc.party/c/internet-censorship-all-around-the-world/10>

## 3. Rate limiting without accounts

| Layer | Stops | Cost |
|---|---|---|
| Fixed request shape `{lessonId, code, question}`, prompt built on the server, `max_tokens` ≈ 400, code ≤ 8 KB | Using the proxy as a free general LLM; huge prompts | ~10 lines |
| CORS allowlist for our origin | Casual reuse from other sites (not real security; curl ignores CORS) | 1 line |
| Daily counter per anonymous ID (UUID in `localStorage`, sent as a header), e.g. 30 hints | Normal overuse by one student | One YDB upsert per call |
| Daily counter per IP (hashed), set looser (e.g. 300), since schools and mobile networks share IPs | Scripts that rotate the anon ID | Same table |
| **Global daily token budget** (sum `usage.total_tokens` from each response) | Any abuse that gets past the layers above; caps the bill | Same table |
| Provider-side cap: DeepSeek prepaid balance (a hard stop), Yandex budget alert (notification only) | A bug in our own counters | Config only |
| Later: SmartCaptcha once per session, which returns an HMAC-signed token valid 1 h that the proxy checks | Bots at scale | Add when needed |

On the Cloudflare rate-limit binding: its own docs say it is per-location and approximate, and they advise against IP keys. That is one more reason to keep the counters in a real DB.

## Recommendation

1. Create a Yandex Cloud account (Russian card, 4000 ₽ grant). Put one Cloud Function behind an HTTPS trigger and keep the key in Lockbox.
2. Call DeepSeek-V4.1-Flash through Yandex AI Studio's OpenAI-compatible endpoint. Verify the exact model URI in the console first: the pricing page lists the model, but its URI was not checked here.
3. Rate-limit with YDB counters: anon ID, IP, and a global daily token budget.
4. When volume grows, point the same code at `api.deepseek.com` (`deepseek-flash`) and pay with a foreign card or reseller for about 7x lower cost. Then the DeepSeek prepaid balance becomes a hard spend cap.

Deferred: SmartCaptcha tokens, streaming responses, a hand-graded eval of hint quality, and re-checking Qwen and z.ai API reachability from a Russian IP.
