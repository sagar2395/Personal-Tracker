import { AsyncLocalStorage } from "async_hooks";

interface CloudflareContext {
  env?: any;
  ctx?: any;
  cf?: any;
}

const cloudflareContextALS = new AsyncLocalStorage<CloudflareContext>();

export function getCloudflareContext(): CloudflareContext | undefined {
  return cloudflareContextALS.getStore();
}

export function getCloudflareEnv() {
  const context = getCloudflareContext();
  return context?.env;
}
