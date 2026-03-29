export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const client_id = env.GITHUB_CLIENT_ID;

  if (!client_id) {
    return new Response("GITHUB_CLIENT_ID 환경변수가 설정되지 않았습니다.", { status: 500 });
  }

  const redirect_uri = `${url.origin}/api/callback`;

  const authUrl = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=repo`;

  return Response.redirect(authUrl, 302);
}
