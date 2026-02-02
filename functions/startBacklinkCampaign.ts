import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const deepseekKey = Deno.env.get("DEEPSEEK_API_KEY");
        if (!deepseekKey) throw new Error("DEEPSEEK_API_KEY required");

        const callDeepSeek = async (prompt) => {
             const response = await fetch("https://api.deepseek.com/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${deepseekKey}`
                },
                body: JSON.stringify({
                    model: "deepseek-chat",
                    messages: [{ role: "user", content: prompt }],
                    response_format: { type: "json_object" }
                })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            return JSON.parse(data.choices[0].message.content);
        };

        const { campaign_id } = await req.json();

        // Buscar campanha
        const campaigns = await base44.entities.Campaign.filter({ id: campaign_id });
        const campaign = campaigns[0];

        if (!campaign) {
            return Response.json({ error: 'Campaign not found' }, { status: 404 });
        }

        // Gerar variações de âncoras com IA
        const anchorPrompt = `
Gere ${Math.min(campaign.backlinks_target, 20)} variações de anchor text para SEO.

KEYWORDS: ${campaign.keywords.join(', ')}
URL: ${campaign.target_url}

Distribua assim:
- 20% exact match (keyword exata)
- 25% partial match (keyword + palavras)
- 15% branded (nome do site)
- 20% generic (clique aqui, saiba mais)
- 20% LSI (sinônimos e relacionadas)

Retorne apenas o JSON com array "anchors" contendo strings de texto.
`;

        const anchorResult = await callDeepSeek(anchorPrompt);
        const anchors = anchorResult.anchors || [];

        // Gerar variações de conteúdo com IA
        const contentPrompt = `
Crie ${Math.min(campaign.backlinks_target, 15)} variações curtas de conteúdo para backlinks.

KEYWORDS: ${campaign.keywords.join(', ')}
URL: ${campaign.target_url}
CONTEXTO: ${campaign.auto_spinning ? 'Gerar variações únicas e naturais' : 'Conteúdo padrão'}

Cada variação deve ter 80-150 palavras, ser natural e incluir as keywords organicamente.

Retorne JSON com array "contents" contendo strings de texto.
`;

        const contentResult = await callDeepSeek(contentPrompt);
        const contents = contentResult.contents || [];

        // Descobrir sites potenciais com IA
        const discoveryPrompt = `
Liste 50 plataformas reais onde é possível criar perfis e backlinks para o nicho relacionado às keywords: ${campaign.keywords.join(', ')}

Inclua plataformas do tipo: ${campaign.template_type}

Para cada plataforma, forneça:
- URL base
- Tipo (web20, forum, blog, directory, social, comment)
- DA estimado (0-100)

Retorne apenas JSON com objeto { "platforms": [{ "url": "...", "type": "...", "da": 0 }] }.
`;

        const discoveryResult = await callDeepSeek(discoveryPrompt);
        const platforms = discoveryResult.platforms || [];

        // Criar Jobs de Outreach para processamento em massa
        const jobsToCreate = [];
        const targetCount = Math.min(campaign.backlinks_target, platforms.length);

        for (let i = 0; i < targetCount; i++) {
            const platform = platforms[i % platforms.length];
            const anchor = anchors[i % anchors.length] || campaign.keywords[0];
            const content = contents[i % contents.length] || `Conteúdo sobre ${campaign.keywords[0]}`;

            jobsToCreate.push({
                campaign_id: campaign.id,
                target_url: platform.url,
                platform_type: platform.type || 'other',
                content_payload: {
                    anchor,
                    content,
                    target_url: campaign.target_url
                },
                status: 'pending',
                scheduled_for: new Date().toISOString()
            });
        }

        // Criar jobs em batch
        if (jobsToCreate.length > 0) {
            // Chunking to avoid payload limits if huge
            const chunkSize = 50;
            for (let i = 0; i < jobsToCreate.length; i += chunkSize) {
                const chunk = jobsToCreate.slice(i, i + chunkSize);
                await base44.asServiceRole.entities.OutreachJob.bulkCreate(chunk);
            }
        }

        // Atualizar campanha
        await base44.asServiceRole.entities.Campaign.update(campaign.id, {
            status: 'active',
            backlinks_created: 0, // Reset, will increase as jobs complete
            domain_authority: Math.round(platforms.reduce((sum, p) => sum + (p.da || 0), 0) / platforms.length)
        });

        return Response.json({
            success: true,
            jobs_created: jobsToCreate.length,
            platforms_discovered: platforms.length,
            message: `Campanha iniciada! ${jobsToCreate.length} jobs de outreach adicionados à fila.`
        });

    } catch (error) {
        console.error('Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
