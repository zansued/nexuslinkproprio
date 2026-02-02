export async function solveCaptcha(apiKey, siteKey, pageUrl, type = 'userrecaptcha') {
    // This is a helper function to interact with 2Captcha API
    // Documentation: https://2captcha.com/api-docs/quick-start
    
    const BASE_URL = 'http://2captcha.com';

    // 1. Submit the captcha task
    const submitUrl = `${BASE_URL}/in.php?key=${apiKey}&method=${type}&googlekey=${siteKey}&pageurl=${pageUrl}&json=1`;
    
    try {
        const submitResponse = await fetch(submitUrl);
        const submitData = await submitResponse.json();

        if (submitData.status !== 1) {
            throw new Error(`Captcha submission failed: ${submitData.request}`);
        }

        const captchaId = submitData.request;
        console.log(`Captcha task submitted. ID: ${captchaId}`);

        // 2. Poll for the result
        let attempts = 0;
        const maxAttempts = 30; // 30 * 2s = 60s timeout
        
        while (attempts < maxAttempts) {
            await new Promise(r => setTimeout(r, 2000)); // Wait 2 seconds
            
            const resultUrl = `${BASE_URL}/res.php?key=${apiKey}&action=get&id=${captchaId}&json=1`;
            const resultResponse = await fetch(resultUrl);
            const resultData = await resultResponse.json();

            if (resultData.status === 1) {
                console.log("Captcha solved successfully!");
                return resultData.request; // This is the token
            }

            if (resultData.request !== 'CAPCHA_NOT_READY') {
                throw new Error(`Captcha solution failed: ${resultData.request}`);
            }

            attempts++;
        }

        throw new Error("Captcha solution timed out");

    } catch (error) {
        console.error("Captcha Solver Error:", error);
        throw error;
    }
}
