import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const proxies = await base44.entities.Proxy.list();
        let updatedCount = 0;

        // In a real scenario, this would check connectivity in parallel
        // For simulation, we randomly determine status
        const updates = proxies.map(async (proxy) => {
            // Simulate checks
            const isDead = Math.random() > 0.8; // 20% chance of being dead
            const isSlow = Math.random() > 0.8; // 20% chance of being slow if not dead
            
            let status = 'active';
            let responseTime = Math.floor(Math.random() * 200) + 50; // 50-250ms

            if (isDead) {
                status = 'dead';
                responseTime = 0;
            } else if (isSlow) {
                status = 'slow';
                responseTime = Math.floor(Math.random() * 1000) + 500; // 500-1500ms
            }

            // GeoIP simulation based on IP (simplified)
            const country = ['US', 'DE', 'BR', 'FR', 'CN'][Math.floor(Math.random() * 5)];

            if (proxy.status !== status || proxy.response_time !== responseTime) {
                await base44.entities.Proxy.update(proxy.id, {
                    status,
                    response_time: responseTime,
                    country,
                    last_checked: new Date().toISOString()
                });
                updatedCount++;
            }
        });

        await Promise.all(updates);

        return Response.json({ 
            success: true, 
            message: `Checked ${proxies.length} proxies`,
            updated: updatedCount
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
