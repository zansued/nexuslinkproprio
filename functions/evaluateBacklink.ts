import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

export const evaluateBacklink = async (backlinkId, base44) => {
    // 1. Fetch Backlink
    const backlinks = await base44.entities.Backlink.filter({ id: backlinkId });
    if (!backlinks.length) throw new Error("Backlink not found");
    const backlink = backlinks[0];

    // 2. Fetch Campaign for context
    const campaigns = await base44.entities.Campaign.filter({ id: backlink.campaign_id });
    const campaign = campaigns[0];

    // 3. Prepare Prompt
    const prompt = `
    Analyze the quality of this SEO backlink.
    
    Context:
    - Target URL: ${backlink.target_url}
    - Source URL: ${backlink.source_url}
    - Anchor Text: ${backlink.anchor_text}
    - Platform Type: ${backlink.platform_type}
    - Domain Authority (DA): ${backlink.domain_authority || "Unknown"}
    
    Campaign Context:
    - Campaign Keywords: ${campaign?.keywords?.join(", ") || "General SEO"}
    
    Task:
    Evaluate the backlink based on:
    1. Relevance of source to target keywords.
    2. Quality of the anchor text (natural vs spammy).
    3. Potential SEO impact considering DA and platform type.
    
    Return a JSON object with:
    - quality_score (0-100 integer)
    - relevance_score (0-100 integer)
    - summary (concise text explanation, max 2 sentences)
    `;

    // 4. Call LLM (DeepSeek)
    const deepseekKey = Deno.env.get("DEEPSEEK_API_KEY");
    if (!deepseekKey) throw new Error("DEEPSEEK_API_KEY required");

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
    const result = JSON.parse(data.choices[0].message.content);

    // 5. Update Entity
    await base44.entities.Backlink.update(backlinkId, {
        quality_score: result.quality_score,
        relevance_score: result.relevance_score,
        analysis_summary: result.summary,
        last_analyzed: new Date().toISOString()
    });

    return result;
};

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { backlinkId } = await req.json();
        if (!backlinkId) return Response.json({ error: 'backlinkId required' }, { status: 400 });

        const result = await evaluateBacklink(backlinkId, base44);
        return Response.json(result);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
