export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return new Response('No code provided', { status: 400 });
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

    if (tokenData.error) {
      console.error('GitHub token error:', tokenData);
      return new Response('Token error', { status: 400 });
    }

    // Decap CMS가 정확히 기대하는 postMessage 형식 (가장 중요한 부분)
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
          (function() {
            const targetOrigin = '${url.origin}';
            
            // 부모 창(Decap CMS)에 토큰 전달
            if (window.opener) {
              window.opener.postMessage(${JSON.stringify(message)}, targetOrigin);
              console.log('PostMessage sent to', targetOrigin);
            }
            
            // 1초 후 자동으로 창 닫기 (안전장치)
            setTimeout(() => {
              window.close();
            }, 800);
          })();
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
    return new Response('Authentication failed', { status: 500 });
  }
}
