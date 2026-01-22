export function preloadResources() {
  // Preload only critical resources that are needed immediately
  // Currently no critical resources need preloading

  // DNS prefetch for external resources
  const domains = [
    "tafojbtftmihrheeyoky.supabase.co",
    "www.googletagmanager.com",
  ];

  domains.forEach((domain) => {
    const dnsPrefetch = document.createElement("link");
    dnsPrefetch.rel = "dns-prefetch";
    dnsPrefetch.href = `//${domain}`;
    document.head.appendChild(dnsPrefetch);
  });
}
