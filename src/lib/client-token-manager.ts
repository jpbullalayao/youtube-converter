// Client-side token generation utility
// This runs in the browser to avoid server-side bot detection

interface ClientTokens {
  visitorData: string;
  timestamp: number;
}

export class ClientTokenManager {
  private static readonly CACHE_KEY = 'youtube_client_tokens';
  private static readonly CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours

  private static getCachedTokens(): ClientTokens | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;
      
      const tokens: ClientTokens = JSON.parse(cached);
      const isExpired = Date.now() - tokens.timestamp > this.CACHE_DURATION;
      
      if (isExpired) {
        localStorage.removeItem(this.CACHE_KEY);
        return null;
      }
      
      return tokens;
    } catch {
      return null;
    }
  }

  private static setCachedTokens(tokens: ClientTokens): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(tokens));
    } catch {
      // Ignore localStorage errors
    }
  }

  private static async generateVisitorData(): Promise<string> {
    try {
      console.log('Client: Generating visitor data...');
      
      const response = await fetch('https://www.youtube.com/youtubei/v1/visitor_id?key=AIzaSyDCU8hByM-4DrUqRUYnGn-3llEO78bcxq8', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': navigator.userAgent,
          'Referer': 'https://www.youtube.com/',
          'Origin': 'https://www.youtube.com'
        },
        body: JSON.stringify({
          context: {
            client: {
              clientName: 'WEB',
              clientVersion: '2.20240304.00.00',
              userAgent: navigator.userAgent
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate visitor data: ${response.status}`);
      }

      const data = await response.json();
      const visitorData = data.responseContext?.visitorData;
      
      if (!visitorData) {
        throw new Error('No visitor data received from YouTube');
      }

      console.log('Client: Visitor data generated successfully');
      return visitorData;
    } catch (error) {
      console.error('Client: Error generating visitor data:', error);
      throw error;
    }
  }

  public static async getTokens(): Promise<{ visitorData: string }> {
    // Check for cached tokens first
    const cached = this.getCachedTokens();
    if (cached) {
      console.log('Client: Using cached visitor data');
      return { visitorData: cached.visitorData };
    }

    // Generate new tokens
    console.log('Client: Generating new visitor data...');
    const visitorData = await this.generateVisitorData();
    
    // Cache the tokens
    this.setCachedTokens({
      visitorData,
      timestamp: Date.now()
    });

    return { visitorData };
  }

  public static async refreshTokens(): Promise<{ visitorData: string }> {
    console.log('Client: Forcing token refresh...');
    
    // Clear cache
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.CACHE_KEY);
    }
    
    // Generate new tokens
    return this.getTokens();
  }

  public static clearCache(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.CACHE_KEY);
    }
  }
}