import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Link2, Sparkles, Copy, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AnchorVariationPreview({ keywords, targetUrl }) {
  const [anchorVariations, setAnchorVariations] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const generateAnchorVariations = async () => {
    if (keywords.length === 0) return;

    setIsGenerating(true);
    
    try {
      const prompt = `
Você é um especialista em SEO e otimização de anchor text. Sua tarefa é gerar variações estratégicas de anchor text para campanhas de backlinks.

KEYWORDS: ${keywords.join(', ')}
URL ALVO: ${targetUrl}

INSTRUÇÕES:
1. Gere 15 variações de anchor text divididas nas seguintes categorias:

   A) EXACT MATCH (20%) - 3 variações
   - Usar exatamente a keyword principal
   
   B) PARTIAL MATCH (25%) - 4 variações
   - Incluir a keyword com palavras adicionais naturais
   
   C) BRANDED (15%) - 2 variações
   - Usar o nome da marca/site extraído da URL
   
   D) GENERIC (20%) - 3 variações
   - Textos genéricos como "clique aqui", "saiba mais", "visite o site"
   
   E) LSI KEYWORDS (20%) - 3 variações
   - Usar sinônimos e palavras relacionadas semanticamente

2. Para cada variação, forneça:
   - O texto da âncora
   - A categoria
   - O nível de naturalidade (1-10)
   - Quando usar (contexto recomendado)

Retorne APENAS o JSON, sem explicações.
`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            anchors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  text: { type: "string" },
                  category: { type: "string" },
                  naturalness: { type: "number" },
                  usage_context: { type: "string" }
                }
              }
            },
            distribution_strategy: { type: "string" }
          }
        }
      });

      setAnchorVariations(result.anchors || []);
    } catch (error) {
      console.error("Erro ao gerar variações de âncora:", error);
      // Demo fallback
      setAnchorVariations([
        {
          text: keywords[0] || "SEO automation",
          category: "Exact Match",
          naturalness: 7,
          usage_context: "Em conteúdo altamente relevante"
        },
        {
          text: `melhor ferramenta de ${keywords[0] || 'SEO'}`,
          category: "Partial Match",
          naturalness: 9,
          usage_context: "Em reviews e comparações"
        },
        {
          text: "clique aqui para saber mais",
          category: "Generic",
          naturalness: 10,
          usage_context: "Em CTAs e calls-to-action"
        },
        {
          text: "confira esta solução",
          category: "Generic",
          naturalness: 10,
          usage_context: "Em contextos conversacionais"
        },
        {
          text: "automação de marketing digital",
          category: "LSI Keyword",
          naturalness: 8,
          usage_context: "Em conteúdo relacionado"
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Exact Match': '#ef4444',
      'Partial Match': '#fbbf24',
      'Branded': '#10e6f6',
      'Generic': '#8b5cf6',
      'LSI Keyword': '#00ffae'
    };
    return colors[category] || '#10e6f6';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-[#00ffae]" />
          <h3 className="font-bold text-[#00ffae]">Variação de Âncoras (Anchor Text)</h3>
        </div>
        <Button
          onClick={generateAnchorVariations}
          disabled={isGenerating || keywords.length === 0}
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

      <div className="p-4 bg-[#050505] border border-[#1f1f1f] rounded-lg">
        <p className="text-xs text-[#10e6f6] leading-relaxed">
          <span className="text-[#00ffae] font-bold">Estratégia de Distribuição:</span> Para links naturais e seguros, 
          use 20% exact match, 25% partial match, 15% branded, 20% generic e 20% LSI keywords. 
          Isso evita over-optimization e penalizações do Google.
        </p>
      </div>

      {anchorVariations.length > 0 && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          <Label className="text-[#00ffae]">Variações de Âncora Geradas:</Label>
          {anchorVariations.map((anchor, idx) => (
            <div
              key={idx}
              className="p-3 bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg hover:border-[#00ffae] transition-all group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-bold text-[#00ffae] text-sm">"{anchor.text}"</p>
                    <span 
                      className="text-xs px-2 py-0.5 rounded font-bold"
                      style={{ 
                        background: `${getCategoryColor(anchor.category)}22`,
                        border: `1px solid ${getCategoryColor(anchor.category)}`,
                        color: getCategoryColor(anchor.category)
                      }}
                    >
                      {anchor.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mb-1 text-xs">
                    <div>
                      <span className="text-[#10e6f6]">Naturalidade: </span>
                      <span className="text-[#00ffae] font-bold">{anchor.naturalness}/10</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#10e6f6] italic">{anchor.usage_context}</p>
                </div>

                <Button
                  onClick={() => copyToClipboard(anchor.text, idx)}
                  className="bg-[#00ffae] text-[#050505] hover:bg-[#00cc8e] opacity-0 group-hover:opacity-100 transition-opacity"
                  size="sm"
                >
                  {copiedIndex === idx ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {keywords.length === 0 && (
        <div className="text-center py-6 text-[#10e6f6] text-sm">
          <p>Adicione keywords no Passo 2 para gerar variações de âncoras</p>
        </div>
      )}
    </div>
  );
}
