
  
  const require = (await import("node:module")).createRequire(import.meta.url);
  const __filename = (await import("node:url")).fileURLToPath(import.meta.url);
  const __dirname = (await import("node:path")).dirname(__filename);

  const defaultDefineProperty = Object.defineProperty;
  Object.defineProperty = function(o, p, a) {
    if(p=== '__import_unsupported' && Boolean(globalThis.__import_unsupported)) {
      return;
    }
    return defaultDefineProperty(o, p, a);
  };
  
  
  globalThis.openNextDebug = false;globalThis.openNextVersion = "3.1.3";
async function s(n){let t=new URL(n.url).pathname,e=globalThis._ROUTES.find(r=>r.regex.some(a=>new RegExp(a).test(t)));if(!e)throw new Error(`No route found for ${n.url}`);let o=await self._ENTRIES[`middleware_${e.name}`].default({page:e.page,request:{...n,page:{name:e.name}}});return await o.waitUntil,o.response}export{s as default};
