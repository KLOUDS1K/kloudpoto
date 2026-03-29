export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);
  const provider = searchParams.get("provider");
  const site_id = searchParams.get("site_id");

  // GitHub OAuth 설정값 (이전 대화에서 만든 Client ID)
  const client_id = "Ov23lihsu5zBTBJ3jUHG"; 

  const url = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=repo&state=${site_id}`;

  return Response.redirect(url, 302);
}
