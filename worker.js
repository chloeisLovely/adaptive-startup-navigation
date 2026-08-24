/**
 * ═══════════════════════════════════════════════════════════════════
 * ASNM — AI 프록시 (Cloudflare Worker)
 * ───────────────────────────────────────────────────────────────────
 * 목적: API 키를 브라우저에 노출하지 않고 LLM을 호출한다.
 *
 * 브라우저 → 이 Worker → OpenAI
 *            (키는 여기에만 존재)
 *
 * ── 배포 방법 (5분, 무료 플랜으로 충분) ──
 * 1. dash.cloudflare.com → Workers & Pages → Create → Worker
 * 2. 이 파일 내용을 전부 붙여넣고 Deploy
 * 3. Settings → Variables and Secrets 에서 추가:
 *      OPENAI_API_KEY   (Secret 타입으로)  = sk-...
 *      ALLOWED_ORIGIN   (Text)            = https://chloeislovely.github.io
 *      OPENAI_MODEL     (Text, 선택)       = gpt-4o-mini
 *      MONTHLY_LIMIT    (Text, 선택)       = 2000
 * 4. 배포 URL을 config.js 의 aiProxyUrl 에 붙여넣기
 *
 * ── 이 Worker가 하는 방어 ──
 * · CORS를 내 도메인으로 제한 → 남이 내 키로 요금 태우는 것 차단
 * · IP당 분당 요청 제한 → 스크립트 남용 차단
 * · 최대 토큰 상한 → 한 번의 호출로 큰 비용이 나가는 것 차단
 * · 월 호출 상한 → 예산 사고 방지
 * ═══════════════════════════════════════════════════════════════════
 */

const RATE_LIMIT_PER_MIN = 10;      // IP당 분당 요청 수
const MAX_TOKENS_CAP     = 1200;    // 응답 토큰 상한
const MAX_MESSAGES       = 20;      // 대화 길이 상한
const MAX_CHARS          = 12000;   // 입력 총 길이 상한

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '';
    const allowed = env.ALLOWED_ORIGIN || '';

    // 내 도메인에서 온 요청만 허용 (localhost는 개발용으로 허용)
    const isAllowed =
      (allowed && origin === allowed) ||
      origin.startsWith('http://localhost') ||
      origin.startsWith('http://127.0.0.1');

    const cors = {
      'Access-Control-Allow-Origin': isAllowed ? origin : allowed,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method !== 'POST') {
      return json({ error: 'POST 요청만 허용됩니다.' }, 405, cors);
    }

    if (!isAllowed) {
      return json({ error: '허용되지 않은 출처입니다.' }, 403, cors);
    }

    if (!env.OPENAI_API_KEY) {
      return json({ error: '서버에 API 키가 설정되지 않았습니다.' }, 503, cors);
    }

    // ── 레이트 리밋 (KV 바인딩이 있을 때만 동작) ──
    if (env.ASNM_KV) {
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      const minute = Math.floor(Date.now() / 60000);
      const rk = `rate:${ip}:${minute}`;
      const cur = parseInt((await env.ASNM_KV.get(rk)) || '0', 10);
      if (cur >= RATE_LIMIT_PER_MIN) {
        return json({ error: '요청이 너무 많습니다. 1분 후 다시 시도해 주세요.' }, 429, cors);
      }
      ctx.waitUntil(env.ASNM_KV.put(rk, String(cur + 1), { expirationTtl: 120 }));

      // 월 예산 상한
      if (env.MONTHLY_LIMIT) {
        const mk = `month:${new Date().toISOString().slice(0, 7)}`;
        const used = parseInt((await env.ASNM_KV.get(mk)) || '0', 10);
        if (used >= parseInt(env.MONTHLY_LIMIT, 10)) {
          return json({ error: '이번 달 AI 사용 한도에 도달했습니다.' }, 429, cors);
        }
        ctx.waitUntil(env.ASNM_KV.put(mk, String(used + 1), { expirationTtl: 2678400 }));
      }
    }

    // ── 입력 검증 ──
    let body;
    try {
      body = await request.json();
    } catch (_) {
      return json({ error: '잘못된 요청 형식입니다.' }, 400, cors);
    }

    const messages = body.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      return json({ error: 'messages 배열이 필요합니다.' }, 400, cors);
    }
    if (messages.length > MAX_MESSAGES) {
      return json({ error: '대화가 너무 깁니다.' }, 400, cors);
    }
    const totalChars = messages.reduce(
      (n, m) => n + String((m && m.content) || '').length, 0);
    if (totalChars > MAX_CHARS) {
      return json({ error: '입력이 너무 깁니다.' }, 400, cors);
    }
    for (const m of messages) {
      if (!m || !['system', 'user', 'assistant'].includes(m.role)) {
        return json({ error: '메시지 role 값이 올바르지 않습니다.' }, 400, cors);
      }
    }

    const maxTokens = Math.min(
      parseInt(body.max_tokens, 10) || 800, MAX_TOKENS_CAP);
    const temperature = Math.min(Math.max(
      Number(body.temperature) || 0.7, 0), 1.5);

    // ── OpenAI 호출 ──
    let upstream;
    try {
      upstream = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: env.OPENAI_MODEL || 'gpt-4o-mini',
          messages,
          temperature,
          max_tokens: maxTokens
        })
      });
    } catch (_) {
      return json({ error: 'AI 서버에 연결할 수 없습니다.' }, 502, cors);
    }

    if (!upstream.ok) {
      // 상위 오류 메시지를 그대로 흘리지 않는다 (키·계정 정보 유출 방지)
      const status = upstream.status === 429 ? 429 : 502;
      return json({ error: 'AI 응답을 가져오지 못했습니다.' }, status, cors);
    }

    const data = await upstream.json();
    const content = data?.choices?.[0]?.message?.content || '';

    return json({
      content,
      model: env.OPENAI_MODEL || 'gpt-4o-mini'
    }, 200, cors);
  }
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...cors }
  });
}
