interface TokenCache {
  visitorData: string | null;
  poToken: string | null;
  expiresAt: number;
}

class TokenManager {
  private cache: TokenCache = {
    visitorData: null,
    poToken: null,
    expiresAt: 0
  };
  
  private readonly TOKEN_EXPIRY_HOURS = 12;

  private isTokenExpired(): boolean {
    return Date.now() >= this.cache.expiresAt;
  }

  private async generateVisitorData(): Promise<string> {
    try {
      console.log('Generating visitor data...');
      
      // Import proxy fetch dynamically to avoid issues in browser environment
      const { fetchYouTube } = await import('./proxy-fetch');
      
      const response = await fetchYouTube('https://www.youtube.com/youtubei/v1/visitor_id?key=AIzaSyDCU8hByM-4DrUqRUYnGn-3llEO78bcxq8', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        },
        body: JSON.stringify({
          context: {
            client: {
              clientName: 'WEB',
              clientVersion: '2.20240304.00.00'
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

      console.log('Visitor data generated successfully');
      return visitorData;
    } catch (error) {
      console.error('Error generating visitor data:', error);
      throw error;
    }
  }

  private async generatePoToken(): Promise<string> {
    try {
      console.log('Generating PO token...');
      
      // For now, we'll skip PO token generation due to complexity
      // and focus on visitor_data which is often sufficient
      console.log('PO token generation skipped - using visitor_data only');
      return '';
    } catch (error) {
      console.error('Error generating PO token:', error);
      throw error;
    }
  }

  public async getTokens(): Promise<{ visitorData: string; poToken: string }> {
    try {
      // Check if we have valid cached tokens
      if (!this.isTokenExpired() && this.cache.visitorData && this.cache.poToken) {
        console.log('Using cached tokens');
        return {
          visitorData: this.cache.visitorData,
          poToken: this.cache.poToken
        };
      }

      console.log('Generating new tokens...');
      
      // Generate visitor data first
      const visitorData = await this.generateVisitorData();
      
      // Generate PO token using visitor data
      const poToken = await this.generatePoToken();
      
      // Cache the tokens
      this.cache = {
        visitorData,
        poToken,
        expiresAt: Date.now() + (this.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)
      };

      console.log('New tokens generated and cached');
      return { visitorData, poToken };
    } catch (error) {
      console.error('Failed to get tokens:', error);
      
      // If we have cached tokens, use them even if expired
      if (this.cache.visitorData && this.cache.poToken) {
        console.log('Using expired cached tokens as fallback');
        return {
          visitorData: this.cache.visitorData,
          poToken: this.cache.poToken
        };
      }
      
      throw error;
    }
  }

  public async refreshTokens(): Promise<{ visitorData: string; poToken: string }> {
    console.log('Forcing token refresh...');
    this.cache.expiresAt = 0; // Force expiration
    return this.getTokens();
  }

  public clearCache(): void {
    console.log('Clearing token cache...');
    this.cache = {
      visitorData: null,
      poToken: null,
      expiresAt: 0
    };
  }
}

// Create a singleton instance
export const tokenManager = new TokenManager();