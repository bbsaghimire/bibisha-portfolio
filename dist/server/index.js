const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8"
};

export default {
  async fetch(request, env) {
    if (env.ASSETS && typeof env.ASSETS.fetch === "function") {
      return env.ASSETS.fetch(request);
    }

    const url = new URL(request.url);
    const assetPath = url.pathname === "/" ? "/index.html" : url.pathname;
    const asset = env["__STATIC_ASSETS__"]?.get ? await env["__STATIC_ASSETS__"].get(assetPath) : null;
    if (asset) {
      const extension = assetPath.slice(assetPath.lastIndexOf("."));
      return new Response(asset, { headers: { "content-type": MIME_TYPES[extension] || "application/octet-stream" } });
    }
    return new Response("Not found", { status: 404 });
  }
};
