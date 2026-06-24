// Access Cloudflare environment bindings set by OpenNext
export function getCloudflarEnv() {
  // Access through the Symbol that OpenNext sets up
  try {
    const cfContext = (globalThis as any)[Symbol.for("__cloudflare-context__")];
    if (cfContext?.env) {
      console.log("[CF_ENV] Found Cloudflare context, available bindings:", Object.keys(cfContext.env || {}));
      return cfContext.env;
    } else {
      console.log("[CF_ENV] Cloudflare context not found");
    }
  } catch (e) {
    console.error("[CF_ENV] Error accessing Cloudflare context:", e);
  }

  // Fallback: return empty object if not in Cloudflare environment
  return null;
}

export function getD1Database() {
  const env = getCloudflarEnv();
  if (env?.personal_tracker_db) {
    console.log("[D1] D1 database binding found!");
    return env.personal_tracker_db;
  }
  console.log("[D1] D1 database binding NOT found");
  return null;
}
