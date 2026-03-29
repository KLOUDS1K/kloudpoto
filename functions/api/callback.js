export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return new Response("인증 코드가 없습니다.", { status: 400 });
  }

  try {
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code: code
      })
    });

    const tokenData = await tokenResponse.json();

    const html = `
      <script>
        if (window.opener) {
          window.opener.postMessage({
            type: "authorization:github:success",
            token: "${tokenData.access_token}",
            provider: "github"
          }, "${url.origin}");
        }
        window.close();
      </script>
    `;

    return new Response(html, {
      headers: { "Content-Type": "text/html" },
      status: 200
    });

  } catch (err) {
    return new Response("GitHub 인증 중 오류가 발생했습니다.", { status: 500 });
  }
}
