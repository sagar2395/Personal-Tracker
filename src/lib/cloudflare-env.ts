// Access Cloudflare environment bindings set by OpenNext
export function getCloudflarEnv() {
  // Access through the Symbol that OpenNext sets up
  try {
    const cfContext = (globalThis as any)[Symbol.for("__cloudflare-context__")];
    if (cfContext?.env) {
      return cfContext.env;
    }
  } catch (e) {
    // Continue to other methods
  }

  // Fallback: return empty object if not in Cloudflare environment
  return null;
}

export function getD1Database() {
  const env = getCloudflarEnv();
  if (env?.personal_tracker_db) {
    return env.personal_tracker_db;
  }
  return null;
}
