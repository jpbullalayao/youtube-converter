import { HttpsProxyAgent } from 'https-proxy-agent';

interface ProxyConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
  type: 'http' | 'https' | 'socks5';
}

interface ProxyProvider {
  name: string;
  getProxies(): ProxyConfig[];
  isEnabled: boolean;
}

class ProxyManager {
  private providers: ProxyProvider[] = [];
  private currentProxyIndex = 0;
  private failedProxies = new Set<string>();
  private lastUsed = new Map<string, number>();
  private readonly PROXY_COOLDOWN = 60000; // 1 minute cooldown for failed proxies

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // Rotating Residential Proxies (Add your proxy service details)
    if (process.env.PROXY_SERVICE_1_ENABLED === 'true') {
      this.providers.push({
        name: 'Primary Proxy Service',
        isEnabled: true,
        getProxies: () => this.parseProxyList(process.env.PROXY_SERVICE_1_LIST || '')
      });
    }

    // Backup Proxy Service
    if (process.env.PROXY_SERVICE_2_ENABLED === 'true') {
      this.providers.push({
        name: 'Backup Proxy Service',
        isEnabled: true,
        getProxies: () => this.parseProxyList(process.env.PROXY_SERVICE_2_LIST || '')
      });
    }

    // Free proxy fallback (for testing - not recommended for production)
    if (process.env.FREE_PROXY_ENABLED === 'true') {
      this.providers.push({
        name: 'Free Proxy Service',
        isEnabled: true,
        getProxies: () => [
          { host: '8.208.84.236', port: 3128, type: 'http' },
          { host: '47.74.152.29', port: 8888, type: 'http' },
          { host: '43.207.168.71', port: 3128, type: 'http' }
        ]
      });
    }
  }

  private parseProxyList(proxyList: string): ProxyConfig[] {
    if (!proxyList) return [];

    return proxyList.split(',').map(proxy => {
      const parts = proxy.trim().split(':');
      if (parts.length >= 2) {
        return {
          host: parts[0],
          port: parseInt(parts[1]),
          username: parts[2],
          password: parts[3],
          type: 'http' as const
        };
      }
      return null;
    }).filter(Boolean) as ProxyConfig[];
  }

  private getAllProxies(): ProxyConfig[] {
    return this.providers
      .filter(provider => provider.isEnabled)
      .flatMap(provider => provider.getProxies());
  }

  private getProxyKey(proxy: ProxyConfig): string {
    return `${proxy.host}:${proxy.port}`;
  }

  private isProxyAvailable(proxy: ProxyConfig): boolean {
    const key = this.getProxyKey(proxy);
    
    // Check if proxy is in failed list and cooldown period
    if (this.failedProxies.has(key)) {
      const lastUsed = this.lastUsed.get(key) || 0;
      if (Date.now() - lastUsed < this.PROXY_COOLDOWN) {
        return false;
      }
      // Remove from failed list after cooldown
      this.failedProxies.delete(key);
    }

    return true;
  }

  public getNextProxy(): ProxyConfig | null {
    const proxies = this.getAllProxies();
    if (proxies.length === 0) {
      console.log('No proxies configured');
      return null;
    }

    // Try to find an available proxy starting from current index
    for (let i = 0; i < proxies.length; i++) {
      const proxyIndex = (this.currentProxyIndex + i) % proxies.length;
      const proxy = proxies[proxyIndex];
      
      if (this.isProxyAvailable(proxy)) {
        this.currentProxyIndex = (proxyIndex + 1) % proxies.length;
        console.log(`Using proxy: ${proxy.host}:${proxy.port}`);
        return proxy;
      }
    }

    console.warn('No available proxies found');
    return null;
  }

  public markProxyFailed(proxy: ProxyConfig) {
    const key = this.getProxyKey(proxy);
    this.failedProxies.add(key);
    this.lastUsed.set(key, Date.now());
    console.log(`Marked proxy as failed: ${key}`);
  }

  public createProxyAgent(proxy: ProxyConfig) {
    let proxyUrl = `${proxy.type}://${proxy.host}:${proxy.port}`;
    
    if (proxy.username && proxy.password) {
      proxyUrl = `${proxy.type}://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`;
    }

    return new HttpsProxyAgent(proxyUrl);
  }

  public async testProxy(proxy: ProxyConfig): Promise<boolean> {
    try {
      const agent = this.createProxyAgent(proxy);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch('https://httpbin.org/ip', {
        // @ts-expect-error - Node.js fetch supports agent parameter
        agent,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Proxy ${proxy.host}:${proxy.port} working, IP: ${data.origin}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Proxy test failed for ${proxy.host}:${proxy.port}:`, error);
      return false;
    }
  }

  public getProxyStats() {
    const allProxies = this.getAllProxies();
    const failedCount = this.failedProxies.size;
    const availableCount = allProxies.filter(p => this.isProxyAvailable(p)).length;

    return {
      total: allProxies.length,
      available: availableCount,
      failed: failedCount,
      providers: this.providers.length
    };
  }
}

// Export a singleton instance
export const proxyManager = new ProxyManager();