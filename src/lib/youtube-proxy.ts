import { Innertube } from 'youtubei.js';
import { proxyManager } from './proxy-manager';

// Custom fetch function that uses proxy for YouTube requests
async function createProxiedFetch() {
  // Only create proxy fetch in server environment
  if (typeof window !== 'undefined') {
    return fetch;
  }

  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    
    // Check if this is a YouTube request
    const isYouTubeRequest = url.includes('youtube.com') || url.includes('youtubei');
    
    if (!isYouTubeRequest) {
      return fetch(input, init);
    }

    console.log(`Proxying YouTube request: ${url}`);
    
    // Try to get a proxy
    const proxy = proxyManager.getNextProxy();
    
    if (proxy) {
      try {
        const proxyAgent = proxyManager.createProxyAgent(proxy);
        
        const response = await fetch(input, {
          ...init,
          // @ts-expect-error - Node.js fetch supports agent parameter
          agent: proxyAgent,
          headers: {
            ...init?.headers,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Referer': 'https://www.youtube.com/',
            'Origin': 'https://www.youtube.com'
          }
        });

        if (response.ok) {
          console.log(`Proxy request successful via ${proxy.host}:${proxy.port}`);
          return response;
        } else {
          console.warn(`Proxy returned ${response.status}, marking as failed`);
          proxyManager.markProxyFailed(proxy);
        }
      } catch (error) {
        console.error(`Proxy request failed for ${proxy.host}:${proxy.port}:`, error);
        proxyManager.markProxyFailed(proxy);
      }
    }
    
    // Fallback to direct connection
    console.log('Using direct connection as fallback');
    return fetch(input, init);
  };
}

export async function createProxiedInnertube(config: Record<string, unknown> = {}) {
  try {
    const proxiedFetch = await createProxiedFetch();
    
    // Create Innertube instance with custom fetch
    const innertube = await Innertube.create({
      ...config,
      fetch: proxiedFetch
    });
    
    console.log('Created Innertube instance with proxy support');
    return innertube;
  } catch (error) {
    console.error('Failed to create proxied Innertube instance:', error);
    // Fallback to regular Innertube
    console.log('Falling back to regular Innertube instance');
    return await Innertube.create(config);
  }
}

export { proxyManager };