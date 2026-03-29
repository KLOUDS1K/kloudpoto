export async function onRequestGet(context) {
  try {
    const { searchParams } = new URL(context.request.url);
    const site_id = searchParams.get("site_id");

    // 🔑 본인의 깃허브 Client ID (따옴표 필수!)
    const client_id = "Ov23lihsu5zBTBJ3jUHG"; 

    if (!client_id || client_id.includes("이곳에")) {
      return new Response("Client ID가 올바르지 않습니다. 코드를 확인해 주세요.", { status: 400 });
    }

    const githubUrl = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=repo&state=${site_id}`;

    return Response.redirect(githubUrl, 302);
  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
}
