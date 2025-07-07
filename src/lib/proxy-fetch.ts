import { proxyManager } from './proxy-manager';

interface ProxyFetchOptions extends RequestInit {
  useProxy?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

interface ProxyFetchResult {
  response: Response;
  usedProxy: boolean;
  proxyHost?: string;
  attempts: number;
}

class ProxyFetch {
  private static readonly DEFAULT_MAX_RETRIES = 3;
  private static readonly DEFAULT_RETRY_DELAY = 1000;

  public static async fetch(
    url: string, 
    options: ProxyFetchOptions = {}
  ): Promise<ProxyFetchResult> {
    const {
      useProxy = true,
      maxRetries = this.DEFAULT_MAX_RETRIES,
      retryDelay = this.DEFAULT_RETRY_DELAY,
      ...fetchOptions
    } = options;

    let lastError: Error | null = null;
    let attempts = 0;

    // If proxy is disabled or we're in a browser environment, use direct fetch
    if (!useProxy || typeof window !== 'undefined') {
      const response = await fetch(url, fetchOptions);
      return {
        response,
        usedProxy: false,
        attempts: 1
      };
    }

    // Try with proxies first
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      attempts++;
      const proxy = proxyManager.getNextProxy();

      if (proxy) {
        try {
          console.log(`Attempt ${attempt + 1}: Trying proxy ${proxy.host}:${proxy.port}`);
          
          const proxyAgent = proxyManager.createProxyAgent(proxy);
          const response = await fetch(url, {
            ...fetchOptions,
            // @ts-expect-error - Node.js fetch supports agent parameter
            agent: proxyAgent,
            headers: {
              ...fetchOptions.headers,
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
              'Accept': 'application/json, text/plain, */*',
              'Accept-Language': 'en-US,en;q=0.9',
              'Accept-Encoding': 'gzip, deflate, br',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });

          // If successful, return the response
          if (response.ok) {
            console.log(`Proxy request successful: ${proxy.host}:${proxy.port}`);
            return {
              response,
              usedProxy: true,
              proxyHost: `${proxy.host}:${proxy.port}`,
              attempts
            };
          }

          // If response is not ok, mark proxy as failed and try next
          console.warn(`Proxy returned non-OK response: ${response.status}`);
          proxyManager.markProxyFailed(proxy);

        } catch (error) {
          console.error(`Proxy request failed: ${proxy.host}:${proxy.port}`, error);
          proxyManager.markProxyFailed(proxy);
          lastError = error as Error;
        }

        // Wait before retrying
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        }
      } else {
        console.log('No available proxy found, will try direct connection');
        break;
      }
    }

    // If all proxies failed, try direct connection as fallback
    console.log('All proxies failed, attempting direct connection...');
    try {
      const response = await fetch(url, fetchOptions);
      console.log('Direct connection successful');
      return {
        response,
        usedProxy: false,
        attempts
      };
    } catch (error) {
      console.error('Direct connection also failed:', error);
      throw lastError || error;
    }
  }

  public static async fetchWithRetry(
    url: string,
    options: ProxyFetchOptions = {},
    isYouTubeRequest = false
  ): Promise<Response> {
    // Enable proxy by default for YouTube requests
    const fetchOptions = {
      useProxy: isYouTubeRequest,
      ...options
    };

    const result = await this.fetch(url, fetchOptions);
    
    if (isYouTubeRequest) {
      console.log(`YouTube request completed: ${result.usedProxy ? 'via proxy' : 'direct'} (${result.attempts} attempts)`);
    }

    return result.response;
  }
}

// Convenience function for YouTube API requests
export const fetchYouTube = (url: string, options: RequestInit = {}) => {
  return ProxyFetch.fetchWithRetry(url, options, true);
};

// General proxy fetch function
export const proxyFetch = (url: string, options: ProxyFetchOptions = {}) => {
  return ProxyFetch.fetch(url, options);
};

export default ProxyFetch;