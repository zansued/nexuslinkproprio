import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { campaign_id } = await req.json();

        // Buscar campanha e seus backlinks
        const campaigns = await base44.entities.Campaign.filter({ id: campaign_id });
        const campaign = campaigns[0];

        if (!campaign) {
            return Response.json({ error: 'Campaign not found' }, { status: 404 });
        }

        const backlinks = await base44.entities.Backlink.filter({ campaign_id: campaign.id });

        // Usar IA para simular verificação de indexação e métricas
        const metricsPrompt = `
Analise as métricas SEO para a URL: ${campaign.target_url}

Total de backlinks criados: ${backlinks.length}
Keywords: ${campaign.keywords.join(', ')}

Simule métricas realistas:
- Domain Authority (DA) estimado: 0-100
- Domain Rating (DR) estimado: 0-100
- Páginas indexadas no Google
- Taxa de indexação dos backlinks (%)

Retorne apenas JSON.
`;

        const metricsResult = await base44.integrations.Core.InvokeLLM({
            prompt: metricsPrompt,
            add_context_from_internet: true,
            response_json_schema: {
                type: "object",
                properties: {
                    domain_authority: { type: "number" },
                    domain_rating: { type: "number" },
                    indexed_pages: { type: "number" },
                    indexation_rate: { type: "number" }
                }
            }
        });

        // Atualizar status de indexação dos backlinks (simulado)
        const indexationRate = metricsResult.indexation_rate || 0.7;
        let updatedCount = 0;

        for (const backlink of backlinks) {
            if (!backlink.indexed && Math.random() < indexationRate) {
                await base44.asServiceRole.entities.Backlink.update(backlink.id, {
                    indexed: true,
                    status: 'indexed'
                });
                updatedCount++;
            }
        }

        const totalIndexed = backlinks.filter(b => b.indexed).length + updatedCount;

        // Atualizar métricas da campanha
        await base44.asServiceRole.entities.Campaign.update(campaign.id, {
            domain_authority: metricsResult.domain_authority || campaign.domain_authority,
            domain_rating: metricsResult.domain_rating || 0,
            indexed_pages: totalIndexed
        });

        return Response.json({
            success: true,
            metrics: {
                domain_authority: metricsResult.domain_authority,
                domain_rating: metricsResult.domain_rating,
                indexed_pages: totalIndexed,
                total_backlinks: backlinks.length,
                indexation_rate: `${Math.round((totalIndexed / backlinks.length) * 100)}%`
            },
            message: 'Métricas atualizadas com sucesso'
        });

    } catch (error) {
        console.error('Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
