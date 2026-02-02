import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        // Use service role if triggered by automation, or user auth if triggered manually
        // Check both contexts
        let user;
        try {
             user = await base44.auth.me();
        } catch(e) {
             // If automation calls this, it might not have a user session, 
             // but we'll assume for now it's either triggered by user or we use service role logic if we had it.
             // For this app context, let's assume manual trigger or valid session for now.
        }

        // Fetch pending jobs
        const pendingJobs = await base44.entities.OutreachJob.filter({ status: 'pending' }, '-scheduled_for', 10); // Batch of 10

        if (pendingJobs.length === 0) {
            return Response.json({ message: 'No pending jobs' });
        }

        // Fetch active proxies
        const activeProxies = await base44.entities.Proxy.filter({ status: 'active' });
        
        const results = [];

        for (const job of pendingJobs) {
            // Assign Proxy (Round Robin or Random)
            const proxy = activeProxies.length > 0 
                ? activeProxies[Math.floor(Math.random() * activeProxies.length)] 
                : null;

            // Update job to processing
            await base44.entities.OutreachJob.update(job.id, { 
                status: 'processing',
                proxy_id: proxy ? proxy.id : null 
            });

            try {
                // SIMULATE OUTREACH EXECUTION
                // This is where the heavy logic would go: 
                // 1. Connect via Proxy
                // 2. Navigate to platform
                // 3. Login/Register
                // 4. Post Content
                
                // Simulation delay
                await new Promise(r => setTimeout(r, 1000));

                const success = Math.random() > 0.2; // 80% success rate
                
                if (success) {
                    await base44.entities.OutreachJob.update(job.id, {
                        status: 'success',
                        completed_at: new Date().toISOString(),
                        logs: `Successfully posted via ${proxy ? proxy.ip : 'Direct'}. URL created.`
                    });
                    
                    // Also create a Backlink entity record
                    // Extract actual target_url and anchor from content payload
                    const payload = typeof job.content_payload === 'string' 
                        ? JSON.parse(job.content_payload) 
                        : job.content_payload || {};

                    await base44.entities.Backlink.create({
                        campaign_id: job.campaign_id,
                        source_url: job.target_url, // URL where link was placed (target of the job)
                        target_url: payload.target_url || 'N/A', // The site being promoted
                        anchor_text: payload.anchor || payload.anchor_text || 'link',
                        content_snippet: payload.content || '',
                        status: 'active',
                        platform_type: job.platform_type,
                        domain_authority: 0, // Will be updated by analysis later
                        indexed: false
                    });
                    
                } else {
                    throw new Error("Timeout or Captcha failure");
                }

                results.push({ id: job.id, status: 'success' });

            } catch (err) {
                // Handle Retry Logic
                const newRetryCount = (job.retry_count || 0) + 1;
                const newStatus = newRetryCount >= 3 ? 'failed' : 'retrying'; // Retry up to 3 times
                
                await base44.entities.OutreachJob.update(job.id, {
                    status: newStatus,
                    retry_count: newRetryCount,
                    logs: `Error: ${err.message}. Retry ${newRetryCount}/3`
                });
                
                // If retrying, reset to pending (or keep as retrying for specific handler)
                if (newStatus === 'retrying') {
                     // Optionally reschedule
                }
                
                results.push({ id: job.id, status: 'error', error: err.message });
            }
        }

        return Response.json({ processed: results.length, details: results });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
