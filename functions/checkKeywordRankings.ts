import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const rankings = await base44.entities.KeywordRanking.list();
        
        // Group by campaign to get context if needed, but here we just iterate
        const updates = rankings.map(async (item) => {
            // Simulate ranking check logic
            // In production, this would call an SERP API
            
            // Logic: 
            // 80% chance to stay same or move slightly
            // 10% chance to jump up
            // 10% chance to drop
            
            let newRank = item.rank || 0;
            const change = Math.floor(Math.random() * 5) - 2; // -2 to +2 variation
            
            // First time check simulation
            if (newRank === 0) {
                newRank = Math.floor(Math.random() * 90) + 1; // 1-90
            } else {
                newRank = Math.max(1, newRank - change); // Lower is better (rank 1 is best)
            }

            // Simulate "Not Found" sometimes (rank > 100)
            if (Math.random() > 0.95) newRank = 0;

            if (newRank !== item.rank) {
                await base44.entities.KeywordRanking.update(item.id, {
                    previous_rank: item.rank,
                    rank: newRank,
                    check_date: new Date().toISOString(),
                    url_found: newRank > 0 ? `https://example.com/page-${Math.floor(Math.random()*10)}` : null
                });
            }
        });

        await Promise.all(updates);

        return Response.json({ success: true, checked: rankings.length });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
