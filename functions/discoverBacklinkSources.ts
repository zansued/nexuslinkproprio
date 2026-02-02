import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { keywords, platform_type = "mixed", limit = 50 } = await req.json();

        if (!keywords || keywords.length === 0) {
            return Response.json({ error: 'Keywords are required' }, { status: 400 });
        }

        // Usar IA com contexto da internet para descobrir sites reais
        const discoveryPrompt = `
Você é um especialista em SEO e link building. Descubra ${limit} plataformas REAIS e ativas onde é possível criar perfis, posts e backlinks.

KEYWORDS/NICHO: ${keywords.join(', ')}
TIPO DE PLATAFORMA: ${platform_type}

Para cada plataforma, forneça:
1. URL completa (ex: https://medium.com)
2. Nome da plataforma
3. Tipo exato (web20, forum, blog, directory, social, comment)
4. Domain Authority estimado (0-100)
5. Facilidade de criação de conta (easy/medium/hard)
6. Permite links dofollow? (true/false)

Priorize:
- Plataformas com boa autoridade (DA > 30)
- Sites que permitem links dofollow
- Plataformas ativas e populares
- Facilidade de criar conta

${platform_type === 'mixed' ? 'Misture diferentes tipos de plataformas.' : `Foque em plataformas do tipo ${platform_type}.`}

Retorne apenas JSON válido.
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
                messages: [{ role: "user", content: discoveryPrompt }],
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        const result = JSON.parse(data.choices[0].message.content);

        const platforms = result.platforms || [];

        return Response.json({
            success: true,
            platforms: platforms,
            total: platforms.length,
            strategy: result.strategy_notes,
            stats: {
                dofollow_count: platforms.filter(p => p.dofollow).length,
                avg_da: Math.round(platforms.reduce((sum, p) => sum + (p.domain_authority || 0), 0) / platforms.length),
                by_type: platforms.reduce((acc, p) => {
                    acc[p.type] = (acc[p.type] || 0) + 1;
                    return acc;
                }, {})
            }
        });

    } catch (error) {
        console.error('Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
