import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { campaign_id, keyword, target_url } = await req.json();

        // Use LLM with web search to "Simulate" a Rank Tracker
        // This is a "Money Robot" style workaround since we don't have a SerpApi key
        
        const prompt = `
        Search on Google for the keyword "${keyword}" and find the rank/position of the website "${target_url}".
        Scan the first 3 pages of results.
        
        Return ONLY a JSON object with:
        - rank: number (position found, or 0 if not found)
        - url_found: string (the specific url found in SERP)
        - search_volume: number (estimated monthly volume if available, or null)
        - difficulty: number (estimated difficulty 0-100 if available, or null)
        `;

        const response = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            add_context_from_internet: true,
            response_json_schema: {
                type: "object",
                properties: {
                    rank: { type: "number" },
                    url_found: { type: "string" },
                    search_volume: { type: "number" },
                    difficulty: { type: "number" }
                }
            }
        });

        // Save result
        // Check if previous ranking exists to store history
        const previousRankings = await base44.entities.KeywordRanking.filter({ 
            campaign_id, keyword 
        }, "-check_date", 1);
        
        const previous_rank = previousRankings.length > 0 ? previousRankings[0].rank : null;

        await base44.entities.KeywordRanking.create({
            campaign_id,
            keyword,
            rank: response.rank || 0,
            previous_rank: previous_rank,
            url_found: response.url_found || "",
            search_engine: "google",
            search_volume: response.search_volume || 0,
            difficulty: response.difficulty || 0,
            check_date: new Date().toISOString()
        });

        return Response.json({ success: true, data: response });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
