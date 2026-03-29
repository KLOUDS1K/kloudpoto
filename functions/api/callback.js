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

    // Decap CMS에서 가장 잘 먹히는 renderBody 방식
    function renderBody(status, content) {
      const html = `
        <script>
          const receiveMessage = (message) => {
            window.opener.postMessage(
              'authorization:github:success:${JSON.stringify(content)}',
              message.origin
            );
            window.removeEventListener("message", receiveMessage, false);
          };
          window.addEventListener("message", receiveMessage, false);

          // authorizing 신호 먼저 보내기
          window.opener.postMessage("authorizing:github", "*");

          // 성공 신호 보내기
          window.opener.postMessage(
            'authorization:github:success:${JSON.stringify(content)}',
            "${url.origin}"
          );

          setTimeout(() => window.close(), 1500);
        </script>
      `;
      return html;
    }

    const content = {
      token: tokenData.access_token,
      provider: 'github'
    };

    return new Response(renderBody(200, content), {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' },
      status: 200
    });

  } catch (err) {
    console.error(err);
    return new Response('<h1>Authentication failed</h1>', { status: 500 });
  }
}
