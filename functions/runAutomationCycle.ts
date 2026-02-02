import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

export const runAutomationCycle = async (payload, base44) => {
    const logs = [];

    // --- 1. Indexing Automation ---
    const candidatesToIndex = await base44.entities.Backlink.list("-created_date", 100);
    const toIndex = candidatesToIndex.filter(b => 
        b.status === 'active' && 
        (b.domain_authority || 0) > 30 && 
        (!b.indexing_status || b.indexing_status === 'none')
    ).slice(0, 3);

    for (const backlink of toIndex) {
        logs.push(`Triggering indexing for ${backlink.source_url}`);
        await base44.functions.invoke('indexBacklink', { backlink_id: backlink.id });
    }

    // --- 2. Outreach Automation ---
    const sources = await base44.entities.DiscoveredSource.list("-created_date", 100);
    const toProcess = sources.filter(s => s.status === 'qualified').slice(0, 2);

    for (const source of toProcess) {
        logs.push(`Processing source: ${source.url}`);
        
        const accounts = await base44.entities.PlatformAccount.list(); 
        const domain = source.url.replace('https://', '').replace('http://', '').split('/')[0];
        const existingAccount = accounts.find(a => a.domain_url.includes(domain) && a.status === 'active');

        if (existingAccount) {
            logs.push(`Found account for ${domain}, performing outreach...`);
            await base44.functions.invoke('performOutreach', { 
                 platform_account_id: existingAccount.id,
                 target_url: source.url,
                 content: "Great post! Check this out..." 
            });
            await base44.entities.DiscoveredSource.update(source.id, { status: 'processing' });
            await base44.entities.AutomationLog.create({
                action_type: "outreach",
                status: "success",
                details: `Outreach initiated on ${domain} using existing account`,
                target_id: source.id,
                agent_name: "Outreach Specialist"
            });

        } else {
            logs.push(`No account for ${domain}, registering...`);
            const regRes = await base44.functions.invoke('registerPlatformAccount', {
                domain_url: source.url,
                platform_type: source.type
            });
            
            if (regRes.data?.status === 'success') {
                 await base44.entities.DiscoveredSource.update(source.id, { status: 'registered' });
                 await base44.entities.AutomationLog.create({
                    action_type: "registration",
                    status: "success",
                    details: `Registered new account on ${domain}`,
                    target_id: source.id,
                    agent_name: "Outreach Specialist"
                });
            } else {
                await base44.entities.AutomationLog.create({
                    action_type: "registration",
                    status: "failed",
                    details: `Failed to register on ${domain}: ${regRes.data?.error || 'Unknown error'}`,
                    target_id: source.id,
                    agent_name: "Outreach Specialist"
                });
            }
        }
    }

    // --- 3. Mass Outreach Processing (Proxy Aware) ---
    let processed_mass_jobs = 0;
    try {
        const outreachRes = await base44.functions.invoke('processOutreachJobs', {});
        if (outreachRes.data?.processed > 0) {
            processed_mass_jobs = outreachRes.data.processed;
            logs.push(`Processed ${processed_mass_jobs} mass outreach jobs`);
        }
    } catch(e) { logs.push("Mass outreach error: " + e.message); }

    // --- 4. Rank Tracking (Rotational Check) ---
    try {
        const rankingsToCheck = await base44.entities.KeywordRanking.list("check_date", 1); // Get oldest checked
        if (rankingsToCheck.length > 0) {
            const r = rankingsToCheck[0];
            // Only check if it's been more than 24h or it's new
            // For now, always check the one returned to ensure rotation if list returns sorted by oldest
            const campaign = await base44.entities.Campaign.get(r.campaign_id);
            if (campaign) {
                logs.push(`Checking rank for: ${r.keyword}`);
                await base44.functions.invoke('checkRankings', { 
                    campaign_id: r.campaign_id, 
                    keyword: r.keyword, 
                    target_url: campaign.target_url 
                });
            }
        }
    } catch (e) {
        logs.push("Rank check error: " + e.message);
    }

    return { 
        status: "success", 
        processed_indexing: toIndex.length,
        processed_outreach: toProcess.length,
        processed_mass_jobs,
        logs 
    };
};

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const result = await runAutomationCycle({}, base44);
        return Response.json(result);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
