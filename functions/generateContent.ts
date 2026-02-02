import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { content_type, keywords, target_url, tone, length, platform } = await req.json();

        if (!content_type || !keywords) {
            return Response.json({ error: 'content_type and keywords are required' }, { status: 400 });
        }

        let prompt = '';

        switch(content_type) {
            case 'blog_post':
                prompt = `
Você é um especialista em criação de conteúdo SEO e copywriting. Crie um artigo de blog completo e otimizado.

KEYWORDS: ${keywords.join(', ')}
URL ALVO: ${target_url || 'N/A'}
TOM: ${tone || 'profissional'}
TAMANHO: ${length || 'médio'} (curto=500 palavras, médio=1000 palavras, longo=2000 palavras)

INSTRUÇÕES:
1. Crie um artigo ÚNICO e de ALTA QUALIDADE
2. Inclua:
   - Título otimizado para SEO (H1)
   - Introdução cativante
   - 4-6 seções com subtítulos (H2/H3)
   - Conclusão com call-to-action
   - Integre naturalmente as keywords (densidade 1-2%)
   - Inclua ${target_url ? `link contextual para ${target_url}` : 'espaços para links'}
3. Use linguagem natural e engajadora
4. Otimize para featured snippets (listas, parágrafos curtos)
5. Inclua meta description SEO-friendly (155 caracteres)

Retorne JSON com: title, meta_description, content (HTML formatado), word_count, keywords_used
`;
                break;

            case 'social_media':
                prompt = `
Você é um especialista em social media e copywriting. Crie posts otimizados para redes sociais.

KEYWORDS: ${keywords.join(', ')}
URL ALVO: ${target_url || 'N/A'}
PLATAFORMA: ${platform || 'múltiplas'}
TOM: ${tone || 'engajador'}

INSTRUÇÕES:
1. Crie 5 VARIAÇÕES de posts para ${platform || 'Twitter, LinkedIn, Facebook, Instagram'}
2. Cada post deve:
   - Ter tamanho apropriado para a plataforma
   - Incluir call-to-action
   - Usar hashtags relevantes (3-5)
   - Incluir emojis quando apropriado
   - Link para ${target_url || 'URL'}
   - Ser único e cativante
3. Varie o ângulo/abordagem em cada post

Retorne JSON com array "posts", cada item tendo: platform, text, hashtags, emoji_count, char_count
`;
                break;

            case 'spin_variations':
                prompt = `
Você é um especialista em article spinning e criação de conteúdo único para SEO.

KEYWORDS: ${keywords.join(', ')}
URL ALVO: ${target_url || 'N/A'}
PLATAFORMAS: Web 2.0, Forums, Blogs, Comments

INSTRUÇÕES:
1. Crie 10 VARIAÇÕES ÚNICAS de conteúdo para diferentes plataformas
2. Cada variação deve:
   - Ter 150-300 palavras
   - Manter o mesmo significado mas com palavras diferentes
   - Soar completamente natural (não robotizado)
   - Incluir as keywords organicamente
   - Incluir link contextual para ${target_url || 'URL alvo'}
   - Ser adequado para a plataforma específica
3. Variações devem ter 80%+ de unicidade entre si
4. Use sinônimos, reestruturação de frases, mudança de voz (ativa/passiva)

Retorne JSON com array "variations", cada item tendo: platform_type, content, uniqueness_score, word_count, keyword_density
`;
                break;

            case 'meta_descriptions':
                prompt = `
Você é um especialista em SEO on-page e otimização de meta tags.

KEYWORDS: ${keywords.join(', ')}
URL ALVO: ${target_url || 'N/A'}

INSTRUÇÕES:
1. Crie 10 meta descriptions otimizadas
2. Cada uma deve:
   - Ter exatamente 150-155 caracteres
   - Incluir keyword principal
   - Ter call-to-action claro
   - Ser única e cativante
   - Incentivar cliques

Retorne JSON com array "meta_descriptions", cada item tendo: text, char_count, keywords_included
`;
                break;

            default:
                return Response.json({ error: 'Invalid content_type' }, { status: 400 });
        }

        const deepseekKey = Deno.env.get("DEEPSEEK_API_KEY");
        if (!deepseekKey) throw new Error("DEEPSEEK_API_KEY required");

        // Force JSON output structure in prompt since we can't pass complex schema to DeepSeek API strictly in the same way as OpenAI tools
        // But DeepSeek supports json_object response_format. We just need to ensure the prompt asks for the right structure.
        prompt += `\n\nReturn strictly JSON matching the requirements above.`;

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
        const result = JSON.parse(data.choices[0].message.content);

        return Response.json({
            success: true,
            content: result,
            generated_at: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
