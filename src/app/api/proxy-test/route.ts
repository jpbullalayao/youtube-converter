import { NextResponse } from 'next/server';
import { proxyManager } from '@/lib/proxy-manager';

export async function GET() {
  try {
    // Get proxy statistics
    const stats = proxyManager.getProxyStats();
    
    console.log('Testing available proxies...');
    
    // Test a few proxies
    const testResults = [];
    let testedCount = 0;
    const maxTests = 3; // Limit tests to avoid timeout
    
    for (let i = 0; i < maxTests; i++) {
      const proxy = proxyManager.getNextProxy();
      if (!proxy) break;
      
      testedCount++;
      console.log(`Testing proxy ${i + 1}: ${proxy.host}:${proxy.port}`);
      
      const startTime = Date.now();
      const isWorking = await proxyManager.testProxy(proxy);
      const responseTime = Date.now() - startTime;
      
      testResults.push({
        host: proxy.host,
        port: proxy.port,
        working: isWorking,
        responseTime: responseTime,
        status: isWorking ? 'active' : 'failed'
      });
      
      if (!isWorking) {
        proxyManager.markProxyFailed(proxy);
      }
    }
    
    // Try a YouTube request
    let youtubeTestResult = null;
    try {
      console.log('Testing YouTube request through proxy...');
      const { fetchYouTube } = await import('@/lib/proxy-fetch');
      
      const startTime = Date.now();
      const response = await fetchYouTube('https://www.youtube.com/youtubei/v1/visitor_id?key=AIzaSyDCU8hByM-4DrUqRUYnGn-3llEO78bcxq8', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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
      
      const responseTime = Date.now() - startTime;
      
      youtubeTestResult = {
        success: response.ok,
        status: response.status,
        responseTime: responseTime,
        error: response.ok ? null : `HTTP ${response.status}`
      };
      
    } catch (error) {
      youtubeTestResult = {
        success: false,
        status: 0,
        responseTime: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
    
    return NextResponse.json({
      proxyStats: stats,
      testResults: testResults,
      testedCount: testedCount,
      youtubeTest: youtubeTestResult,
      message: `Tested ${testedCount} proxies. ${stats.available}/${stats.total} proxies available.`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Proxy test error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to test proxies',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}