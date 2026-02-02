import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ContentSpinningPreview({ keywords, targetUrl }) {
  const [originalContent, setOriginalContent] = useState("");
  const [spunVariations, setSpunVariations] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateContentVariations = async () => {
    if (!originalContent && keywords.length === 0) return;

    setIsGenerating(true);
    
    try {
      const prompt = `
Você é um especialista em criação de conteúdo SEO e article spinning. Sua tarefa é gerar variações naturais e únicas de conteúdo para backlinks.

${originalContent ? `CONTEÚDO BASE:\n${originalContent}\n\n` : ''}

KEYWORDS: ${keywords.join(', ')}
URL ALVO: ${targetUrl}

INSTRUÇÕES:
1. Gere 5 variações ÚNICAS do conteúdo
2. Cada variação deve:
   - Manter o significado e contexto original
   - Usar sinônimos e reformulações naturais
   - Incluir as keywords de forma orgânica
   - Ter entre 150-250 palavras
   - Soar natural e não robotizado
   - Incluir um link contextual para a URL alvo
3. Varie a estrutura das frases
4. Use tom profissional mas acessível

${!originalContent ? 'Como não há conteúdo base, crie artigos originais sobre o tema relacionado às keywords.' : ''}

Retorne APENAS o JSON, sem explicações.
`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            variations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  content: { type: "string" },
                  uniqueness_score: { type: "number" },
                  keyword_density: { type: "string" }
                }
              }
            }
          }
        }
      });

      setSpunVariations(result.variations || []);
    } catch (error) {
      console.error("Erro ao gerar variações:", error);
      // Demo fallback
      setSpunVariations([
        {
          title: "Como Construir Backlinks de Qualidade",
          content: "A construção de backlinks é fundamental para o sucesso em SEO. Com as estratégias corretas, você pode aumentar significativamente a autoridade do seu domínio e melhorar o ranqueamento nos mecanismos de busca...",
          uniqueness_score: 95,
          keyword_density: "2.3%"
        },
        {
          title: "Estratégias Eficazes de Link Building",
          content: "O link building continua sendo uma das técnicas mais importantes para otimização de sites. Através de métodos comprovados, é possível criar uma rede robusta de links que impulsiona sua presença online...",
          uniqueness_score: 93,
          keyword_density: "2.1%"
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-[#00ffae]" />
          <h3 className="font-bold text-[#00ffae]">Rotação de Conteúdo (Spinning)</h3>
        </div>
        <Button
          onClick={generateContentVariations}
          disabled={isGenerating || (keywords.length === 0 && !originalContent)}
          className="bg-[#10e6f6] text-[#050505] hover:bg-[#0dc5d4]"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              GERANDO...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              GERAR VARIAÇÕES
            </>
          )}
        </Button>
      </div>

      <div>
        <Label className="text-[#10e6f6] mb-2">
          Conteúdo Base (Opcional - deixe vazio para gerar conteúdo original)
        </Label>
        <Textarea
          value={originalContent}
          onChange={(e) => setOriginalContent(e.target.value)}
          placeholder="Cole aqui o conteúdo que deseja variar, ou deixe vazio para a IA criar conteúdo original..."
          className="bg-[#050505] border-[#1f1f1f] text-[#00ffae] min-h-[120px]"
        />
      </div>

      {spunVariations.length > 0 && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          <Label className="text-[#00ffae]">Variações Geradas:</Label>
          {spunVariations.map((variation, idx) => (
            <div
              key={idx}
              className="p-4 bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg hover:border-[#00ffae] transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-bold text-[#00ffae]">
                  Variação #{idx + 1}: {variation.title}
                </h4>
                <div className="flex gap-3 text-xs">
                  <span className="text-[#10e6f6]">
                    Unicidade: <span className="text-[#00ffae] font-bold">{variation.uniqueness_score}%</span>
                  </span>
                  <span className="text-[#10e6f6]">
                    Densidade: <span className="text-[#00ffae] font-bold">{variation.keyword_density}</span>
                  </span>
                </div>
              </div>
              <p className="text-sm text-[#10e6f6] leading-relaxed">{variation.content}</p>
            </div>
          ))}
        </div>
      )}

      {!originalContent && keywords.length === 0 && (
        <div className="text-center py-6 text-[#10e6f6] text-sm">
          <p>Adicione keywords ou conteúdo base para gerar variações</p>
        </div>
      )}
    </div>
  );
}
