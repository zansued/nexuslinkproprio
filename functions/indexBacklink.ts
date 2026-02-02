import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

export const indexBacklink = async (payload, base44) => {
    const { backlink_id } = payload;
    
    const backlink = await base44.entities.Backlink.get(backlink_id);
    if (!backlink) throw new Error("Backlink not found");

    // Mock Indexing Service Call (e.g., IndexNow)
    // In production, this would perform a POST request to IndexNow or Google Indexing API
    
    // Logic: Only index if DA > 30 and status is active
    if (backlink.status !== 'active') {
         return { status: "skipped", message: "Backlink not active" };
    }
    
    if ((backlink.domain_authority || 0) <= 30) {
        return { status: "skipped", message: "DA too low for auto-indexing (<30)" };
    }

    // Simulate API delay
    await new Promise(r => setTimeout(r, 800));

    // 90% Success Rate Simulation
    const success = Math.random() > 0.1;
    
    const newStatus = success ? "submitted" : "failed";
    
    await base44.entities.Backlink.update(backlink_id, {
        indexing_status: newStatus,
        indexing_last_attempt: new Date().toISOString()
    });
    
    // Log the action
    await base44.entities.AutomationLog.create({
        action_type: "indexing",
        status: success ? "success" : "failed",
        details: success ? `Submitted URL ${backlink.source_url} to IndexNow` : "Failed to connect to Indexing API",
        target_id: backlink_id,
        agent_name: "Indexer Bot"
    });

    return { status: success ? "success" : "error", message: success ? "Indexed" : "Failed" };
};

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = await req.json();
        const result = await indexBacklink(payload, base44);
        return Response.json(result);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
