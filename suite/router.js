// Local router for the suite test: one `wrangler dev` session runs this Worker and the four apps together, so they share
// one local identity database. /ra/..., /ua/..., /cea/... and /bd/... reach each app through a service binding.
export default {
  async fetch(request, env) {
    const url = new URL(request.url), [, key, ...rest] = url.pathname.split('/');
    const app = { ra: env.RA, ua: env.UA, cea: env.CEA, bd: env.BD }[key];
    if (!app) return new Response('Unknown app: use /ra, /ua, /cea or /bd', { status: 404 });
    url.pathname = '/' + rest.join('/');
    return app.fetch(new Request(url, request));
  },
};
