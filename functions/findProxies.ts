import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

export const findProxies = async (base44) => {
    const deepseekKey = Deno.env.get("DEEPSEEK_API_KEY");
    if (!deepseekKey) throw new Error("DEEPSEEK_API_KEY required");

    // 1. Ask DeepSeek for reliable proxy sources (Simulated Agent Browsing)
    const prompt = `
    I need to scrape free HTTP/HTTPS proxies for a web scraping project.
    Return a JSON object with a list of 5 reliable, raw text URLs that host lists of free proxies (IP:PORT format).
    Focus on GitHub raw links or similar reliable text lists.
    Examples: 
    - https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt
    - https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt
    
    JSON format: { "sources": ["url1", "url2", ...] }
    `;

    const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${deepseekKey}`
        },
        body: JSON.stringify({
            model: "deepseek-chat",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
        })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    
    // Fallback list if AI fails or returns garbage
    const defaultSources = [
        "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt",
        "https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt",
        "https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/http.txt",
        "https://raw.githubusercontent.com/prxchk/proxy-list/main/http.txt"
    ];

    let aiSources = [];
    try {
        aiSources = JSON.parse(data.choices[0].message.content).sources || [];
    } catch (e) {
        console.error("Failed to parse AI sources", e);
    }

    const sources = [...new Set([...aiSources, ...defaultSources])].filter(url => url.startsWith("http"));
    
    console.log("Hunting proxies from:", sources);

    // 2. Scrape Sources
    let rawProxies = new Set();
    
    for (const url of sources) {
        try {
            const res = await fetch(url);
            if (res.ok) {
                const text = await res.text();
                // Regex for IP:PORT
                const matches = text.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{2,5}/g);
                if (matches) {
                    matches.forEach(p => rawProxies.add(p));
                }
            }
        } catch (e) {
            console.error(`Failed to fetch ${url}:`, e.message);
        }
    }

    // 3. Prepare for DB
    const uniqueProxies = Array.from(rawProxies).slice(0, 100); // Limit import to 100 per run to manage quota
    const newProxies = [];

    // Check existing to avoid duplicates (Optimization: Check in batch or just rely on unique constraint if exists, but entity has auto-id)
    // We'll just fetch all IPs for now (assuming not too many in DB) or just insert and let user clean up.
    // Better: Filter out logic.
    const existing = await base44.entities.Proxy.list(); // Warning: scale issue later
    const existingIps = new Set(existing.map(p => p.ip));

    for (const proxyStr of uniqueProxies) {
        const [ip, port] = proxyStr.split(':');
        if (!existingIps.has(ip)) {
            newProxies.push({
                ip,
                port: parseInt(port),
                protocol: "http",
                status: "testing", // Mark for validation
                country: "Unknown",
                response_time: 0,
                last_checked: new Date().toISOString()
            });
        }
    }

    // 4. Batch Insert
    if (newProxies.length > 0) {
        // Bulk create in chunks
        const chunkSize = 50;
        for (let i = 0; i < newProxies.length; i += chunkSize) {
            await base44.entities.Proxy.bulkCreate(newProxies.slice(i, i + chunkSize));
        }
    }

    return {
        found: rawProxies.size,
        added: newProxies.length,
        sources_used: sources.length
    };
};

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const result = await findProxies(base44);

        return Response.json({
            success: true,
            ...result,
            message: `Hunter Agent finalizado. ${result.found} proxies encontrados, ${result.added} novos adicionados para validação.`
        });

    } catch (error) {
        console.error('Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
