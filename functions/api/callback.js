export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  console.log('Callback called with code:', code ? 'exists' : 'missing');

  if (!code) {
    return new Response('<h1>No code provided</h1><p>GitHub에서 코드가 전달되지 않았습니다.</p>', { status: 400 });
  }

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
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

    const tokenData = await tokenResponse.json();
    console.log('Token response:', tokenData);

    if (tokenData.error) {
      return new Response(`<h1>Token Error: ${tokenData.error}</h1>`, { status: 400 });
    }

    const message = {
      type: 'authorization:github:success',
      token: tokenData.access_token,
      provider: 'github'
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Authenticating to KLOUD CMS...</title>
        <style>body { font-family: sans-serif; padding: 20px; }</style>
      </head>
      <body>
        <h2>로그인 처리 중...</h2>
        <p>잠시만 기다려주세요. 이 창은 자동으로 닫힙니다.</p>
        <script>
          const targetOrigin = "${url.origin}";
          const msg = ${JSON.stringify(message)};

          console.log("🎯 Sending postMessage to:", targetOrigin);
          console.log("📦 Message:", msg);

          if (window.opener) {
            window.opener.postMessage(msg, targetOrigin);
            console.log("✅ postMessage sent successfully!");
          } else {
            console.log("❌ No window.opener found");
          }

          // 창을 3초 동안 유지 (콘솔 볼 수 있게)
          setTimeout(() => {
            console.log("Closing window now...");
            window.close();
          }, 3000);
        </script>
      </body>
      </html>
    `;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' },
      status: 200
    });

  } catch (err) {
    console.error('Callback error:', err);
    return new Response('<h1>Authentication failed</h1><p>오류가 발생했습니다.</p>', { status: 500 });
  }
}
