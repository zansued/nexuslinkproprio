import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { target_url, campaign_id } = await req.json();

        if (!target_url && !campaign_id) {
            return Response.json({ error: 'URL or campaign_id required' }, { status: 400 });
        }

        // Buscar backlinks existentes
        let backlinks = [];
        try {
            if (campaign_id) {
                backlinks = await base44.entities.Backlink.filter({ campaign_id });
            } else if (target_url) {
                backlinks = await base44.entities.Backlink.filter({ target_url });
            }
        } catch (e) {
            console.error("Error fetching backlinks:", e);
            backlinks = [];
        }

        if (!backlinks || backlinks.length === 0) {
            // Check for pending jobs to give better feedback
            let pendingJobsCount = 0;
            let processingMsg = 'Nenhum backlink encontrado para análise';
            
            if (campaign_id) {
                try {
                    const pending = await base44.entities.OutreachJob.filter({ campaign_id, status: 'pending' });
                    const processing = await base44.entities.OutreachJob.filter({ campaign_id, status: 'processing' });
                    pendingJobsCount = pending.length + processing.length;

                    if (pendingJobsCount > 0) {
                        processingMsg = `Campanha em andamento: ${pendingJobsCount} jobs na fila de processamento. Os backlinks aparecerão aqui conforme forem criados.`;
                    } else {
                        // AUTO-RECOVERY: If no backlinks and no pending jobs, restart the campaign
                        console.log(`Campaign ${campaign_id} stalled. Auto-restarting...`);
                        await base44.functions.invoke('startBacklinkCampaign', { campaign_id });
                        processingMsg = "IA detectou campanha parada e reiniciou automaticamente a prospecção de backlinks. Jobs criados.";
                        pendingJobsCount = 1; // Mark as having pending jobs for UI feedback
                    }
                } catch(e) { console.error("Auto-recovery error:", e); }
            }

            return Response.json({
                success: true,
                analysis: {
                    overall_health_score: 0,
                    anchor_diversity: {
                        score: 0,
                        distribution: { exact_match: 0, partial_match: 0, branded: 0, generic: 0, naked_url: 0 },
                        warnings: [processingMsg]
                    },
                    domain_authority: { score: 0, average_da: 0, high_da_count: 0, medium_da_count: 0, low_da_count: 0 },
                    pbn_risk: { risk_score: 0, suspicious_domains: [], risk_factors: [] },
                    toxic_links: [],
                    recommendations: pendingJobsCount > 0 ? ["Aguarde o processamento da fila de outreach"] : ["Comece a criar backlinks para esta campanha"],
                    disavow_list: []
                },
                backlinks_analyzed: 0,
                pending_jobs: pendingJobsCount,
                message: processingMsg
            });
        }

        // Preparar dados para análise de IA
        const backlinksData = backlinks.map(b => ({
            source: b.source_url,
            anchor: b.anchor_text,
            da: b.domain_authority || 0,
            content: b.content_snippet || ''
        }));

        const analysisPrompt = `
Você é um especialista em análise de backlinks e SEO. Analise o perfil de backlinks fornecido e forneça insights detalhados.

BACKLINKS (${backlinks.length} total):
${JSON.stringify(backlinksData.slice(0, 50), null, 2)}

TARGET URL: ${target_url || 'N/A'}

ANÁLISE REQUERIDA:

1. ANCHOR TEXT DIVERSITY
   - Calcule a distribuição de tipos de anchor (exact match, partial, branded, generic, naked URL)
   - Avalie se a distribuição é natural e segura
   - Score de naturalidade (0-100)
   - Identifique over-optimization

2. DOMAIN AUTHORITY PROFILE
   - Média de DA dos domínios referentes
   - Distribuição (high DA, medium DA, low DA)
   - Identifique se há muitos links de sites de baixa qualidade
   - Score de qualidade (0-100)

3. CONTENT RELEVANCE
   - Analise a relevância contextual dos backlinks
   - Identifique links de nichos não relacionados
   - Score de relevância (0-100)

4. PBN RISK DETECTION
   - Identifique padrões suspeitos:
     * Múltiplos links de domínios com conteúdo genérico
     * IPs compartilhados (se detectável pelo padrão)
     * Anchor texts idênticos de múltiplos domínios
     * Conteúdo de baixa qualidade
   - Risk score (0-100, onde 100 = alto risco)
   - Liste domínios suspeitos

5. TOXIC LINKS IDENTIFICATION
   - Identifique links potencialmente tóxicos que devem ser disavow:
     * Spam domains
     * Sites adultos ou ilegais (se detectável)
     * Anchor text spam
     * Sites hackeados
   - Para cada link tóxico, forneça: URL, razão, severidade (low/medium/high)

6. RECOMMENDATIONS
   - Top 5 ações para melhorar o perfil de backlinks
   - Links específicos para disavow (urgente)
   - Estratégias de anchor text
   - Oportunidades de link building

7. OVERALL HEALTH SCORE (0-100)
   - Score geral da saúde do perfil de backlinks

Retorne APENAS JSON válido.
`;

        const deepseekKey = Deno.env.get("DEEPSEEK_API_KEY");
        if (!deepseekKey) throw new Error("DEEPSEEK_API_KEY required");

        const response = await fetch("https://api.deepseek.com/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${deepseekKey}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [{ role: "user", content: analysisPrompt }],
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        if (data.error) throw new Error("DeepSeek API Error: " + data.error.message);
        const result = JSON.parse(data.choices[0].message.content);

        // Save analysis to history
        try {
            await base44.asServiceRole.entities.CampaignAnalysis.create({
                campaign_id: campaign_id || null,
                target_url: target_url || null,
                overall_health_score: result.overall_health_score || 0,
                anchor_diversity_score: result.anchor_diversity?.score || 0,
                domain_authority_score: result.domain_authority?.score || 0,
                pbn_risk_score: result.pbn_risk?.risk_score || 0,
                toxic_links_count: result.toxic_links?.length || 0,
                backlinks_analyzed: backlinks.length,
                analysis_summary: result.recommendations?.[0] || "Análise concluída",
                full_analysis: result
            });
        } catch (saveError) {
            console.error("Error saving analysis:", saveError);
        }

        return Response.json({
            success: true,
            analysis: result,
            backlinks_analyzed: backlinks.length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
