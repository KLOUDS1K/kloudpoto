export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);
  const code = searchParams.get("code");

  const client_id = "Ov23lihsu5zBTBJ3jUHG"; // 👈 여기 본인 Client ID로 꼭 바꾸세요!
  const client_secret = context.env.GITHUB_CLIENT_SECRET;

  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "accept": "application/json",
    },
    body: JSON.stringify({ client_id, client_secret, code }),
  });

  const result = await response.json();
  
  // 로그인 성공 신호를 관리자 창으로 보내는 코드
  return new Response(
    `<html><body><script>
      (function() {
        const target = window.opener || window.parent;
        const result = ${JSON.stringify(result)};
        if (result.access_token) {
          target.postMessage('authorization:github:success:' + JSON.stringify(result), '*');
        } else {
          target.postMessage('authorization:github:error:' + JSON.stringify(result), '*');
        }
      })();
    </script></body></html>`,
    { headers: { "content-type": "text/html" } }
  );
}
