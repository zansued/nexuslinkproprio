import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

async function testProxy(proxy) {
    const proxyUrl = `${proxy.protocol}://${proxy.ip}:${proxy.port}`;
    const testUrl = 'https://api.ipify.org?format=json';
    
    try {
        const startTime = Date.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(testUrl, {
            signal: controller.signal,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        clearTimeout(timeoutId);
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        if (response.ok) {
            const data = await response.json();
            return {
                success: true,
                responseTime,
                ip: data.ip,
                statusCode: response.status
            };
        }

        return { success: false, responseTime, error: 'Non-OK status' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function analyzeProxiesWithAI(proxyResults) {
    const apiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!apiKey) {
        throw new Error('DEEPSEEK_API_KEY not configured');
    }

    const prompt = `Analyze the following proxy test results and provide a quality assessment for each proxy.

Proxy Test Results:
${JSON.stringify(proxyResults, null, 2)}

For each proxy, analyze:
- Response time (faster is better, <1000ms is good, 1000-3000ms is acceptable, >3000ms is slow)
- Success rate of connection
- Stability indicators
- Potential risk factors (extremely fast responses might indicate detection, inconsistent behavior)

Return a JSON array with this exact structure for each proxy:
[
  {
    "proxy_id": "proxy_id_here",
    "quality_score": 0-100,
    "status": "good" | "risky" | "dead" | "slow",
    "analysis": "brief explanation of the assessment",
    "country_detected": "country code if identifiable, or null"
  }
]

Scoring guidelines:
- 80-100: Excellent (fast, reliable, stable)
- 60-79: Good (acceptable performance)
- 40-59: Risky (inconsistent or moderately slow)
- 20-39: Slow (poor performance but functional)
- 0-19: Dead (non-functional or extremely unreliable)`;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
                { role: 'system', content: 'You are a network infrastructure expert specializing in proxy server analysis.' },
                { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3
        })
    });

    if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const result = await response.json();
    const analysisText = result.choices[0].message.content;
    
    try {
        const parsed = JSON.parse(analysisText);
        return Array.isArray(parsed) ? parsed : parsed.results || parsed.proxies || [];
    } catch (e) {
        console.error('Failed to parse AI response:', analysisText);
        return [];
    }
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch all proxies
        const proxies = await base44.entities.Proxy.list();

        if (proxies.length === 0) {
            return Response.json({ 
                message: 'No proxies to validate',
                validated: 0 
            });
        }

        // Test proxies (limit to 10 at a time to avoid overload)
        const proxyTestResults = [];
        const testLimit = Math.min(proxies.length, 10);

        for (let i = 0; i < testLimit; i++) {
            const proxy = proxies[i];
            const testResult = await testProxy(proxy);
            proxyTestResults.push({
                proxy_id: proxy.id,
                ip: proxy.ip,
                port: proxy.port,
                protocol: proxy.protocol,
                test_result: testResult
            });
        }

        // Get AI analysis
        const aiAnalysis = await analyzeProxiesWithAI(proxyTestResults);

        // Update proxies with AI results
        const updates = [];
        for (const analysis of aiAnalysis) {
            const proxy = proxies.find(p => p.id === analysis.proxy_id);
            if (proxy) {
                const testResult = proxyTestResults.find(t => t.proxy_id === analysis.proxy_id);
                
                await base44.asServiceRole.entities.Proxy.update(proxy.id, {
                    status: analysis.status,
                    quality_score: analysis.quality_score,
                    country: analysis.country_detected || proxy.country,
                    response_time: testResult?.test_result?.responseTime,
                    last_checked: new Date().toISOString()
                });

                updates.push({
                    ip: proxy.ip,
                    status: analysis.status,
                    quality_score: analysis.quality_score,
                    analysis: analysis.analysis
                });
            }
        }

        return Response.json({
            success: true,
            validated: updates.length,
            total_proxies: proxies.length,
            results: updates
        });

    } catch (error) {
        console.error('Error validating proxies:', error);
        return Response.json({ 
            error: error.message,
            details: error.stack 
        }, { status: 500 });
    }
});
