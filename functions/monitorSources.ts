import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

async function fetchPageContent(url) {
    try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 10000); // 10s timeout
        const res = await fetch(url, { 
            signal: controller.signal,
            headers: { "User-Agent": "Mozilla/5.0 (compatible; SEOBot/1.0)" } 
        });
        clearTimeout(id);
        if (!res.ok) return "";
        const text = await res.text();
        // Simple cleanup to get main text
        return text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
                   .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
                   .replace(/<[^>]+>/g, " ")
                   .replace(/\s+/g, " ")
                   .substring(0, 10000); // Limit context
    } catch (e) {
        console.error(`Error fetching ${url}:`, e.message);
        return "";
    }
}

async function analyzeWithDeepSeek(url, content, keywords, apiKey) {
    if (!content) return null;
    
    try {
        const prompt = `
        Analyze the following webpage content for backlink opportunity relevance.
        Target Keywords: ${keywords.join(", ")}
        URL: ${url}
        Content Snippet: ${content.substring(0, 3000)}

        Evaluate:
        1. Relevance (0-100): How relevant is this content to the keywords?
        2. Estimated DA (0-100): Estimate Domain Authority based on content quality/type.
        3. Spam Score (0-100): Estimate likelihood of being a spam site.
        4. Platform Type: blog, forum, news, directory, etc.
        5. Priority: high, medium, low.

        Return strictly JSON:
        {
            "relevance_score": number,
            "domain_authority": number,
            "spam_score": number,
            "platform_type": "string",
            "priority": "string",
            "relevance_justification": "string"
        }
        `;

        const res = await fetch("https://api.deepseek.com/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" }
            })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error.message);
        return JSON.parse(data.choices[0].message.content);
    } catch (e) {
        console.error("DeepSeek API Error:", e);
        return null;
    }
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Use service role for background automation if triggered by system, 
        // but here we might be triggered by user or schedule. 
        // If schedule, we need admin access.
        const user = await base44.auth.me().catch(() => null);
        
        // If no user (e.g. scheduled task), use service role if possible or require user to be logged in?
        // Scheduled tasks run as "system" usually? No, Base44 automations currently don't pass auth context if scheduled?
        // Actually Base44 automations run with a specific context.
        // For now, let's assume we use service role or the user passed in `req`.
        // To be safe for automation, we might need `base44.asServiceRole` but that requires specific setup.
        // Let's stick to standard `base44` and assume valid auth or handle it.
        // Note: For scheduled automations, you usually need a service token or similar.
        // Assuming this is triggered manually for now or via a secured endpoint.
        
        const deepseekKey = Deno.env.get("DEEPSEEK_API_KEY");
        if (!deepseekKey) {
            return Response.json({ error: "DEEPSEEK_API_KEY not configured" }, { status: 400 });
        }

        // 1. Get Active Campaigns
        const campaigns = await base44.entities.Campaign.list();
        const activeCampaigns = campaigns.filter(c => c.status === 'active');

        if (activeCampaigns.length === 0) {
            return Response.json({ message: "No active campaigns found." });
        }

        const results = [];

        for (const campaign of activeCampaigns) {
            // 2. Monitor Web (via DeepSeek Generation as Search)
            // Note: DeepSeek API does not have live internet access in this mode, 
            // so we ask it to generate potential high-value targets based on its knowledge 
            // or we accept that this "monitoring" will be based on its training data for evergreen content.
            
            const searchPrompt = `
            List 5 high-quality, popular blog posts, forum threads, or news articles discussing: ${campaign.keywords.join(", ")}. 
            These must be real URLs if possible, or typical URL structures for such content.
            Exclude major social media like Facebook, Twitter.
            Return a JSON object with a property 'urls' containing an array of strings.
            `;

            const searchResponse = await fetch("https://api.deepseek.com/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${deepseekKey}`
                },
                body: JSON.stringify({
                    model: "deepseek-chat",
                    messages: [{ role: "user", content: searchPrompt }],
                    response_format: { type: "json_object" }
                })
            });

            const searchData = await searchResponse.json();
            const searchRes = searchData.choices ? JSON.parse(searchData.choices[0].message.content) : { urls: [] };
            const urls = searchRes.urls || [];

            for (const url of urls) {
                // Check if already discovered
                const existing = await base44.entities.DiscoveredSource.list({ url: url }); // Pseudocode filter, usually .filter({url: url})
                // Use .filter if available or check client side if list returns all. 
                // Assuming .list returns everything for now or use .filter()
                // Optimized: 
                const existingSource = (await base44.entities.DiscoveredSource.filter({ url }, 1)).length > 0;
                
                if (existingSource) continue;

                // 3. Fetch & Analyze
                const content = await fetchPageContent(url);
                if (!content) continue;

                const analysis = await analyzeWithDeepSeek(url, content, campaign.keywords, deepseekKey);

                // Get Prospecting Criteria from Campaign
                const minDA = campaign.target_min_da || 10;
                const maxSpam = campaign.target_max_spam_score || 30;

                if (analysis && 
                    analysis.relevance_score > 50 && 
                    (analysis.domain_authority || 0) >= minDA && 
                    (analysis.spam_score || 0) <= maxSpam) {
                    
                    // 4. Add to DiscoveredSource
                    const newSource = await base44.entities.DiscoveredSource.create({
                        url: url,
                        name: new URL(url).hostname,
                        type: analysis.platform_type || 'other',
                        domain_authority: analysis.domain_authority || 0,
                        spam_score: analysis.spam_score || 0,
                        priority: analysis.priority || 'medium',
                        status: 'new',
                        relevance_score: analysis.relevance_score,
                        relevance_justification: analysis.relevance_justification,
                        related_campaign_id: campaign.id,
                        discovery_notes: "Auto-discovered by DeepSeek Agent"
                    });
                    results.push(newSource);

                    // 5. Auto-Queue Outreach Job (Money Robot Style)
                    // If high quality and campaign is active, queue it up!
                    if (analysis.quality_score > 75) {
                         await base44.entities.OutreachJob.create({
                            campaign_id: campaign.id,
                            target_url: url,
                            platform_type: analysis.platform_type || "other",
                            content_payload: {
                                target_url: campaign.target_url,
                                anchor_text: campaign.keywords[0] || "link",
                                content: "Auto Generated Content" 
                            },
                            status: "pending",
                            retry_count: 0,
                            created_at: new Date().toISOString()
                        });
                    }
                }
            }
        }

        return Response.json({ 
            status: "success", 
            processed_campaigns: activeCampaigns.length,
            new_sources: results.length,
            sources: results 
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
