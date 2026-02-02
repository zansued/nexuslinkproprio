import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, X, Sparkles, Loader2, Brain, TrendingUp, Target } from "lucide-react";
import { base44 } from "@/api/base44Client";
import KeywordValidator from "./KeywordValidator";

export default function StepTwo({ campaignData, setCampaignData }) {
  const [newKeyword, setNewKeyword] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addKeyword = (keyword) => {
    const trimmedKeyword = keyword || newKeyword.trim();
    if (trimmedKeyword && !campaignData.keywords.includes(trimmedKeyword)) {
      setCampaignData({
        ...campaignData,
        keywords: [...campaignData.keywords, trimmedKeyword]
      });
      setNewKeyword("");
    }
  };

  const removeKeyword = (keyword) => {
    setCampaignData({
      ...campaignData,
      keywords: campaignData.keywords.filter(k => k !== keyword)
    });
  };

  const generateKeywordSuggestions = async () => {
    setIsGenerating(true);
    setShowSuggestions(true);
    
    try {
      const prompt = `
Você é um especialista em SEO e pesquisa de palavras-chave. Analise a URL fornecida e gere sugestões inteligentes de palavras-chave.

URL Alvo: ${campaignData.target_url}
${campaignData.name ? `Nome da Campanha: ${campaignData.name}` : ''}
${campaignData.keywords.length > 0 ? `Keywords Existentes: ${campaignData.keywords.join(', ')}` : ''}

INSTRUÇÕES:
1. Analise o nicho e contexto da URL
2. Sugira 10 palavras-chave altamente relevantes
3. Inclua uma mistura de:
   - Keywords de cauda curta (alto volume, alta concorrência)
   - Keywords de cauda longa (médio/baixo volume, baixa concorrência)
   - Keywords de intenção comercial
   - Keywords informacionais

Para cada keyword, forneça:
- A palavra-chave
- Volume de busca estimado (alto/médio/baixo)
- Dificuldade de ranqueamento (alta/média/baixa)
- Tipo (comercial/informacional/navegacional)
- Pontuação de oportunidade (0-100)

Retorne APENAS o JSON, sem explicações adicionais.
`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            keywords: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  keyword: { type: "string" },
                  volume: { type: "string", enum: ["alto", "médio", "baixo"] },
                  difficulty: { type: "string", enum: ["alta", "média", "baixa"] },
                  type: { type: "string", enum: ["comercial", "informacional", "navegacional"] },
                  opportunity_score: { type: "number" },
                  reason: { type: "string" }
                }
              }
            },
            niche_analysis: { type: "string" }
          }
        }
      });

      setAiSuggestions(result.keywords || []);
    } catch (error) {
      console.error("Erro ao gerar sugestões:", error);
      // Fallback para demo
      setAiSuggestions([
        {
          keyword: "SEO automation tool",
          volume: "alto",
          difficulty: "alta",
          type: "comercial",
          opportunity_score: 75,
          reason: "Alta intenção comercial"
        },
        {
          keyword: "backlink building software",
          volume: "médio",
          difficulty: "média",
          type: "comercial",
          opportunity_score: 82,
          reason: "Boa relação volume/concorrência"
        },
        {
          keyword: "how to build backlinks automatically",
          volume: "médio",
          difficulty: "baixa",
          type: "informacional",
          opportunity_score: 88,
          reason: "Long-tail com baixa concorrência"
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const addSuggestion = (suggestion) => {
    addKeyword(suggestion.keyword);
  };

  const getVolumeColor = (volume) => {
    switch(volume) {
      case 'alto': return '#00ffae';
      case 'médio': return '#fbbf24';
      case 'baixo': return '#10e6f6';
      default: return '#10e6f6';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'alta': return '#ef4444';
      case 'média': return '#fbbf24';
      case 'baixa': return '#00ffae';
      default: return '#10e6f6';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#00ffae] glow-text mb-6">
        > PASSO_02: PALAVRAS-CHAVE_
      </h2>

      {/* Keyword Analysis */}
      <KeywordValidator keywords={campaignData.keywords} />

      {/* AI Keyword Generator */}
      <div className="p-4 bg-[#050505] border border-[#1f1f1f] rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#00ffae]" />
            <h3 className="font-bold text-[#00ffae]">Sugestões Inteligentes de IA</h3>
          </div>
          <Button
            onClick={generateKeywordSuggestions}
            disabled={!campaignData.target_url || isGenerating}
            className="bg-[#10e6f6] text-[#050505] hover:bg-[#0dc5d4] pulse-glow"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ANALISANDO...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                GERAR SUGESTÕES
              </>
            )}
          </Button>
        </div>

        {!campaignData.target_url && (
          <p className="text-xs text-[#10e6f6]">
            * Preencha a URL no Passo 1 para gerar sugestões inteligentes
          </p>
        )}

        {/* AI Suggestions Display */}
        {showSuggestions && aiSuggestions.length > 0 && (
          <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
            {aiSuggestions.map((suggestion, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg hover:border-[#10e6f6] transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-bold text-[#00ffae]">{suggestion.keyword}</p>
                      <span 
                        className="text-xs px-2 py-0.5 rounded"
                        style={{ 
                          background: `${suggestion.type === 'comercial' ? '#00ffae' : '#10e6f6'}22`,
                          border: `1px solid ${suggestion.type === 'comercial' ? '#00ffae' : '#10e6f6'}`,
                          color: suggestion.type === 'comercial' ? '#00ffae' : '#10e6f6'
                        }}
                      >
                        {suggestion.type}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 mb-2 text-xs">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" style={{ color: getVolumeColor(suggestion.volume) }} />
                        <span className="text-[#10e6f6]">Volume:</span>
                        <span className="font-bold" style={{ color: getVolumeColor(suggestion.volume) }}>
                          {suggestion.volume}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Target className="w-3 h-3" style={{ color: getDifficultyColor(suggestion.difficulty) }} />
                        <span className="text-[#10e6f6]">Dificuldade:</span>
                        <span className="font-bold" style={{ color: getDifficultyColor(suggestion.difficulty) }}>
                          {suggestion.difficulty}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#00ffae]" />
                        <span className="text-[#10e6f6]">Score:</span>
                        <span className="font-bold text-[#00ffae]">
                          {suggestion.opportunity_score}
                        </span>
                      </div>
                    </div>

                    {suggestion.reason && (
                      <p className="text-xs text-[#10e6f6] italic">{suggestion.reason}</p>
                    )}
                  </div>

                  <Button
                    onClick={() => addSuggestion(suggestion)}
                    disabled={campaignData.keywords.includes(suggestion.keyword)}
                    className="bg-[#00ffae] text-[#050505] hover:bg-[#00cc8e] opacity-0 group-hover:opacity-100 transition-opacity"
                    size="sm"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Keyword Input */}
      <div>
        <Label className="text-[#10e6f6] mb-2">Adicionar Keyword Manualmente</Label>
        <div className="flex gap-2">
          <Input
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
            placeholder="Digite uma palavra-chave"
            className="bg-[#050505] border-[#1f1f1f] text-[#00ffae]"
          />
          <Button
            onClick={() => addKeyword()}
            className="bg-[#00ffae] text-[#050505] hover:bg-[#00cc8e]"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Selected Keywords */}
      {campaignData.keywords.length > 0 && (
        <div>
          <Label className="text-[#10e6f6] mb-2">
            Keywords Selecionadas ({campaignData.keywords.length})
          </Label>
          <div className="flex flex-wrap gap-2">
            {campaignData.keywords.map((keyword, idx) => (
              <span
                key={idx}
                className="flex items-center gap-2 px-3 py-1 bg-[rgba(0,255,174,0.1)] border border-[#00ffae] text-[#00ffae] rounded-lg"
              >
                {keyword}
                <button onClick={() => removeKeyword(keyword)}>
                  <X className="w-4 h-4 hover:text-red-500 transition-colors" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
