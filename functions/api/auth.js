export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  // 🔑 주인님 Client ID로 꼭 바꾸세요!
  const client_id = "Ov23lihsu5zBTBJ3jUHG"; 
  const client_secret = context.env.GITHUB_CLIENT_SECRET;

  try {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "accept": "application/json",
      },
      body: JSON.stringify({ client_id, client_secret, code }),
    });

    const result = await response.json();

    if (result.error) {
      return new Response(`로그인 에러 발생: ${result.error_description}`, { status: 400 });
    }

    // 관리자 창으로 성공 신호를 보내는 핵심 스크립트
    const script = `
      <html><body><script>
        (function() {
          const target = window.opener || window.parent;
          const result = ${JSON.stringify(result)};
          const message = "authorization:github:success:" + JSON.stringify(result);
          target.postMessage(message, "https://${state}");
          window.close(); // 성공하면 창을 닫습니다.
        })();
      </script></body></html>
    `;

    return new Response(script, { headers: { "content-type": "text/html" } });
  } catch (e) {
    return new Response(`서버 오류: ${e.message}`, { status: 500 });
  }
}
