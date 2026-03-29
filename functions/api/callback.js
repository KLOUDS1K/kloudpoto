// functions/api/callback.js
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return new Response('<h1>No code provided</h1>', { status: 400 });
  }

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code: code
      })
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return new Response(`<h1>Token Error: ${tokenData.error}</h1>`, { status: 400 });
    }

    // Decap CMS가 가장 잘 먹는 renderBody 방식
    const html = `
      <script>
        const message = {
          type: "authorization:github:success",
          token: "${tokenData.access_token}",
          provider: "github"
        };

        // 여러 방식으로 동시에 시도 (성공률 높임)
        if (window.opener) {
          window.opener.postMessage(message, "${url.origin}");
          window.opener.postMessage("authorization:github:success:" + JSON.stringify(message), "${url.origin}");
        }

        // 부모 창에 직접 보내기
        window.parent.postMessage(message, "${url.origin}");

        console.log("PostMessage sent to origin: ${url.origin}");

        // 2초 후 창 닫기
        setTimeout(() => window.close(), 2000);
      </script>
      <body style="font-family:sans-serif; padding:30px;">
        <h2>로그인 완료 처리 중...</h2>
        <p>Decap CMS로 돌아가는 중입니다. 잠시만 기다려주세요.</p>
      </body>
    `;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' },
      status: 200
    });

  } catch (err) {
    console.error(err);
    return new Response('<h1>Authentication failed</h1>', { status: 500 });
  }
}
