export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  // 🔑 본인의 깃허브 Client ID (따옴표 필수!)
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
      return new Response(`로그인 에러: ${result.error_description}`, { status: 400 });
    }

    // 성공하면 관리자 화면으로 로그인 정보를 던져주는 코드
    const script = `
      <html><body><script>
        (function() {
          const target = window.opener || window.parent;
          const result = ${JSON.stringify(result)};
          target.postMessage("authorization:github:success:" + JSON.stringify(result), "*");
          window.close();
        })();
      </script></body></html>
    `;

    return new Response(script, { headers: { "content-type": "text/html" } });
  } catch (e) {
    return new Response(`서버 오류: ${e.message}`, { status: 500 });
  }
}
