Deno.serve((req) => {
  const url = new URL(req.url);
  const status = url.searchParams.get('status') ?? 'unknown';
  return Response.redirect(`styla://subscription/return?status=${status}`, 302);
});
