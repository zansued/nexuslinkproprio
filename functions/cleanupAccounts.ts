import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

export const cleanupAccounts = async (payload, base44) => {
    const { action } = payload; // 'scan' or 'delete'
    
    // Fetch all accounts
    const accounts = await base44.entities.PlatformAccount.list();
    
    // Identify bad accounts
    const badAccounts = accounts.filter(acc => {
        const isBadStatus = ['bad_login', 'suspended', 'error'].includes(acc.status);
        // Low performance: At least 5 attempts and < 30% success
        const isLowPerformance = (acc.total_posts || 0) > 5 && (acc.success_rate || 0) < 30;
        return isBadStatus || isLowPerformance;
    });

    if (action === 'delete') {
        const deletedIds = [];
        for (const acc of badAccounts) {
            await base44.entities.PlatformAccount.delete(acc.id);
            deletedIds.push(acc.id);
        }
        return { 
            status: 'success', 
            deleted_count: deletedIds.length, 
            deleted_ids: deletedIds,
            message: `Successfully deleted ${deletedIds.length} problematic accounts.`
        };
    }

    // Default: Scan only
    return { 
        status: 'success', 
        found_count: badAccounts.length, 
        accounts: badAccounts.map(a => ({
            id: a.id, 
            domain: a.domain_url, 
            username: a.username,
            reason: ['bad_login', 'suspended', 'error'].includes(a.status) ? a.status : `Low Performance (${a.success_rate}%)`
        })) 
    };
};

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await req.json();
        const result = await cleanupAccounts(payload, base44);
        
        return Response.json(result);

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
