/* ═══════════════════════════════════════════════════════════════════
   ASNM — 클라이언트 설정
   ═══════════════════════════════════════════════════════════════════ */
window.ASNM_CONFIG = {
  // Cloudflare Worker 주소 
  aiProxyUrl: 'https://asnm-ai.chloehappylee.workers.dev',
  // 사이트 단계 표기
  stage: 'V6 beta',
  // 문의 이메일 
  contactEmail: 'hello.asnm@gmail.com',
  // Public configuration only. Never put service-role or AI secrets here.
  feedbackApiUrl: 'https://uuyydrrjqeejvahfhdmj.supabase.co/functions/v1/asnm',
  supabaseUrl: 'https://uuyydrrjqeejvahfhdmj.supabase.co',
  supabasePublishableKey: 'sb_publishable_IRbVesnodzYWgsObdOWpqw_9FBFBYHp',
  anonymousAnalytics: false
};
