import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

export const qualifySource = async (payload, base44) => {
    const { source_id } = payload;
    
    // 1. Fetch Source Data
    const source = await base44.entities.DiscoveredSource.get(source_id);
    if (!source) throw new Error("Source not found");

    let keywords = [];
    let campaignContext = "";
    
    if (source.related_campaign_id) {
        const campaign = await base44.entities.Campaign.get(source.related_campaign_id);
        if (campaign) {
            keywords = campaign.keywords || [];
            campaignContext = `Campaign Goal: ${campaign.name}. Target URL: ${campaign.target_url}. Keywords: ${keywords.join(", ")}`;
        }
    }

    // 2. AI Analysis using InvokeLLM (simulating web browsing/analysis)
    const prompt = `
    Analyze the following website/source for SEO backlink potential:
    URL: ${source.url}
    Type: ${source.type}
    
    Context:
    ${campaignContext}
    
    Task:
    1. Verify relevance to the campaign keywords.
    2. Estimate/Infer Domain Authority (DA) and Spam Score based on URL structure, typical metrics for this type of site, and industry knowledge.
    3. Suggest a priority (high, medium, low).
    
    Return a JSON object with:
    - relevance_score (0-100)
    - relevance_justification (string)
    - estimated_da (0-100)
    - estimated_spam_score (0-100)
    - quality_justification (string)
    - priority ("high", "medium", "low")
    `;

    const aiRes = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
            type: "object",
            properties: {
                relevance_score: { type: "number" },
                relevance_justification: { type: "string" },
                estimated_da: { type: "number" },
                estimated_spam_score: { type: "number" },
                quality_justification: { type: "string" },
                priority: { type: "string", enum: ["high", "medium", "low"] }
            },
            required: ["relevance_score", "priority"]
        }
    });

    const analysis = aiRes; // InvokeLLM returns the object directly if schema is provided

    // 3. Update Entity
    const updateData = {
        relevance_score: analysis.relevance_score,
        relevance_justification: analysis.relevance_justification,
        domain_authority: analysis.estimated_da, // Updating if it was missing or refining it
        spam_score: analysis.estimated_spam_score,
        quality_justification: analysis.quality_justification,
        priority: analysis.priority,
        status: analysis.priority === 'low' ? 'rejected' : 'qualified'
    };

    await base44.entities.DiscoveredSource.update(source_id, updateData);

    return {
        status: "success",
        data: updateData
    };
};

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = await req.json();
        if (!payload.source_id) return Response.json({ error: 'source_id required' }, { status: 400 });

        const result = await qualifySource(payload, base44);
        return Response.json(result);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
