import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

export const performOutreach = async (payload) => {
    // This function simulates the outreach process: login -> post -> verify
    // In a real scenario, this would involve browser automation (Puppeteer/Playwright) or direct HTTP requests.
    
    const { account_id, campaign_id, target_url, content_data } = payload;
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Check for user's captcha key
    const userApiKey = payload.user_captcha_key;
    
    let captchaSolved = false;
    let logs = ["Login attempted"];

    // Simulate encountering a captcha
    const captchaEncountered = Math.random() < 0.4; // 40% chance of captcha

    if (captchaEncountered) {
        logs.push("Captcha detected!");
        if (userApiKey) {
            logs.push("Using 2Captcha API key to solve...");
            // In a real scenario, we would call:
            // const token = await solveCaptcha(userApiKey, 'SITE_KEY', target_url);
            
            // Simulating API delay and success
            await new Promise(resolve => setTimeout(resolve, 2000));
            logs.push("Captcha solved successfully via 2Captcha!");
            captchaSolved = true;
        } else {
            logs.push("No Captcha API key configured. Failed to solve.");
            return {
                status: "error",
                error: "Captcha required but no API key found",
                logs
            };
        }
    }

    // Simulation logic based on probability
    // If captcha was encountered and solved (or not encountered), high success chance
    // If captcha encountered and NO key, we already returned error above
    
    const baseProbability = 0.95; // High success if no captcha or solved
    const isSuccess = Math.random() < baseProbability;

    if (isSuccess) {
        logs.push("Navigated to post page", "Content submitted", "Post verified");
        return {
            status: "success",
            live_url: `https://example-platform.com/post/${Math.random().toString(36).substring(7)}`,
            message: "Post created successfully",
            logs
        };
    } else {
        const failureReasons = ["Account suspended", "Form submission error", "Timeout"];
        const reason = failureReasons[Math.floor(Math.random() * failureReasons.length)];
        logs.push(reason);
        return {
            status: "error",
            error: reason,
            logs
        };
    }
};

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await req.json();
        
        // Retrieve account details to "use" them (simulated)
        let account = null;
        if (payload.account_id) {
             const accounts = await base44.entities.PlatformAccount.filter({ id: payload.account_id });
             if (accounts.length > 0) account = accounts[0];
        }

        if (!account && !payload.simulate_registration) {
             return Response.json({ error: 'Account not provided and registration not requested' }, { status: 400 });
        }

        // Pass user's captcha key to the worker function
        const result = await performOutreach({
            ...payload,
            user_captcha_key: user.captcha_api_key
        });
        
        // Update account stats if account existed
        if (account) {
            const newTotal = (account.total_posts || 0) + 1;
            const newSuccess = result.status === 'success' ? ((account.total_posts || 0) * (account.success_rate || 100) / 100 + 1) : ((account.total_posts || 0) * (account.success_rate || 100) / 100);
            const newRate = (newSuccess / newTotal) * 100;
            
            // Determine new status based on error
            let newStatus = account.status;
            if (result.status === 'error') {
                if (result.error === "Login failed") newStatus = "bad_login";
                else if (result.error === "Account suspended") newStatus = "suspended";
                else if (result.error && result.error.includes("error")) newStatus = "error";
            } else if (result.status === 'success' && account.status !== 'active') {
                newStatus = 'active'; // Recover if it works now
            }

            await base44.entities.PlatformAccount.update(account.id, {
                last_used: new Date().toISOString(),
                total_posts: newTotal,
                success_rate: Math.round(newRate),
                status: newStatus
            });
        }

        return Response.json(result);

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
