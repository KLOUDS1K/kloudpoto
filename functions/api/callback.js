export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return new Response('<h1>No code</h1>', { status: 400 });
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'kloud-photography'
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code: code
      })
    });

    const tokenData = await response.json();

    if (tokenData.error) {
      return new Response(`<h1>Error: ${tokenData.error}</h1>`, { status: 400 });
    }

    // Decap CMS가 기대하는 정확한 메시지 (가장 중요한 부분)
    const message = {
      type: 'authorization:github:success',
      token: tokenData.access_token,
      provider: 'github'
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head><title>Authenticating...</title></head>
      <body>
        <script>
          const targetOrigin = "${url.origin}";
          const msg = ${JSON.stringify(message)};

          if (window.opener) {
            window.opener.postMessage(msg, targetOrigin);
            console.log("✅ Token successfully sent to Decap CMS");
          } else {
            console.log("⚠️ No opener window");
          }

          // 창 닫기
          setTimeout(() => window.close(), 500);
        </script>
      </body>
      </html>
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
