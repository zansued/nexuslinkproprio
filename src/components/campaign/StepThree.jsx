import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Settings, Database, RefreshCw, Link2, Sparkles, Loader2, Globe, Network } from "lucide-react";
import ContentSpinningPreview from "./ContentSpinningPreview";
import AnchorVariationPreview from "./AnchorVariationPreview";
import SEODiagramPreview from "./SEODiagramPreview";

export default function StepThree({ campaignData, setCampaignData, templates }) {
  const [activeTab, setActiveTab] = useState("config");
  const [suggestedPlatforms, setSuggestedPlatforms] = useState([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const handleSuggestPlatforms = async () => {
    setIsSuggesting(true);
    try {
      const { discoverBacklinkSources } = await import("@/functions/discoverBacklinkSources");
      const result = await discoverBacklinkSources({
        keywords: campaignData.keywords,
        platform_type: campaignData.template_type === 'mixed' ? 'all' : campaignData.template_type,
        limit: 5
      });
      if (result.data && result.data.platforms) {
        setSuggestedPlatforms(result.data.platforms);
      }
    } catch (error) {
      console.error("Failed to suggest platforms:", error);
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#00ffae] glow-text mb-6">
        > PASSO_03: CONFIGURAÇÃO_E_IA_
      </h2>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#1f1f1f] pb-2">
        <button
          onClick={() => setActiveTab("config")}
          className={`px-4 py-2 rounded-t-lg font-bold transition-all ${
            activeTab === 'config'
              ? 'bg-[rgba(0,255,174,0.1)] border border-b-0 border-[#00ffae] text-[#00ffae]'
              : 'text-[#10e6f6] hover:bg-[rgba(0,255,174,0.05)]'
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          CONFIGURAÇÃO
        </button>
        <button
          onClick={() => setActiveTab("spinning")}
          className={`px-4 py-2 rounded-t-lg font-bold transition-all ${
            activeTab === 'spinning'
              ? 'bg-[rgba(0,255,174,0.1)] border border-b-0 border-[#00ffae] text-[#00ffae]'
              : 'text-[#10e6f6] hover:bg-[rgba(0,255,174,0.05)]'
          }`}
        >
          <RefreshCw className="w-4 h-4 inline mr-2" />
          SPINNING
        </button>
        <button
          onClick={() => setActiveTab("anchors")}
          className={`px-4 py-2 rounded-t-lg font-bold transition-all ${
            activeTab === 'anchors'
              ? 'bg-[rgba(0,255,174,0.1)] border border-b-0 border-[#00ffae] text-[#00ffae]'
              : 'text-[#10e6f6] hover:bg-[rgba(0,255,174,0.05)]'
          }`}
        >
          <Link2 className="w-4 h-4 inline mr-2" />
          ÂNCORAS
        </button>
        <button
          onClick={() => setActiveTab("diagrams")}
          className={`px-4 py-2 rounded-t-lg font-bold transition-all ${
            activeTab === 'diagrams'
              ? 'bg-[rgba(0,255,174,0.1)] border border-b-0 border-[#00ffae] text-[#00ffae]'
              : 'text-[#10e6f6] hover:bg-[rgba(0,255,174,0.05)]'
          }`}
        >
          <Network className="w-4 h-4 inline mr-2" />
          DIAGRAMAS SEO
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-6">
        {activeTab === "config" && (
          <div className="space-y-6">
            <div>
              <Label className="text-[#10e6f6] mb-2">Template de Backlinks</Label>
              <Select
                value={campaignData.template_type}
                onValueChange={(value) => setCampaignData({...campaignData, template_type: value})}
              >
                <SelectTrigger className="bg-[#050505] border-[#1f1f1f] text-[#00ffae]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0f0f0f] border-[#1f1f1f]">
                  <SelectItem value="web20">Web 2.0 Blogs</SelectItem>
                  <SelectItem value="forums">Fóruns Especializados</SelectItem>
                  <SelectItem value="blogs">Blog Comments</SelectItem>
                  <SelectItem value="directories">Diretórios Web</SelectItem>
                  <SelectItem value="social">Redes Sociais</SelectItem>
                  <SelectItem value="comments">Comentários</SelectItem>
                  <SelectItem value="mixed">Mix Estratégico (Recomendado)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-[#10e6f6] mt-2">
                * Mix Estratégico combina múltiplas fontes para resultados naturais
              </p>
            </div>

            <div>
              <Label className="text-[#10e6f6] mb-2">Meta de Backlinks</Label>
              <Input
                type="number"
                value={campaignData.backlinks_target}
                onChange={(e) => setCampaignData({...campaignData, backlinks_target: parseInt(e.target.value)})}
                className="bg-[#050505] border-[#1f1f1f] text-[#00ffae]"
                min="10"
                max="10000"
              />
              <p className="text-xs text-[#10e6f6] mt-2">
                * Recomendado: 50-200 backlinks por campanha para crescimento natural
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-[#1f1f1f]">
               <h3 className="font-bold text-[#00ffae] flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Critérios de Prospecção
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#10e6f6] mb-2">DA Mínimo (Domain Authority)</Label>
                    <Input
                      type="number"
                      value={campaignData.target_min_da || 10}
                      onChange={(e) => setCampaignData({...campaignData, target_min_da: parseInt(e.target.value)})}
                      className="bg-[#050505] border-[#1f1f1f] text-[#00ffae]"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <Label className="text-[#10e6f6] mb-2">Spam Score Máximo</Label>
                    <Input
                      type="number"
                      value={campaignData.target_max_spam_score || 30}
                      onChange={(e) => setCampaignData({...campaignData, target_max_spam_score: parseInt(e.target.value)})}
                      className="bg-[#050505] border-[#1f1f1f] text-[#00ffae]"
                      min="0"
                      max="100"
                    />
                  </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-[#1f1f1f]">
              <h3 className="font-bold text-[#00ffae] flex items-center gap-2">
                <Database className="w-5 h-5" />
                Automações de IA
              </h3>

              <label className="flex items-start gap-3 cursor-pointer p-3 bg-[#050505] rounded-lg hover:bg-[#0a0a0a] transition-all">
                <input
                  type="checkbox"
                  checked={campaignData.auto_spinning}
                  onChange={(e) => setCampaignData({...campaignData, auto_spinning: e.target.checked})}
                  className="w-5 h-5 mt-0.5"
                />
                <div>
                  <span className="text-[#00ffae] font-bold block">Rotação Automática de Conteúdo</span>
                  <span className="text-xs text-[#10e6f6]">
                    A IA gerará variações únicas do conteúdo para cada backlink, aumentando a naturalidade
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer p-3 bg-[#050505] rounded-lg hover:bg-[#0a0a0a] transition-all">
                <input
                  type="checkbox"
                  checked={campaignData.anchor_variation}
                  onChange={(e) => setCampaignData({...campaignData, anchor_variation: e.target.checked})}
                  className="w-5 h-5 mt-0.5"
                />
                <div>
                  <span className="text-[#00ffae] font-bold block">Variação de Âncoras</span>
                  <span className="text-xs text-[#10e6f6]">
                    A IA criará diferentes anchor texts seguindo as melhores práticas de SEO
                  </span>
                </div>
              </label>
            </div>

            {/* AI Platform Suggestions */}
            <div className="mt-4 pt-4 border-t border-[#1f1f1f]">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#00ffae]" />
                    <Label className="text-[#00ffae] font-bold">Sugestões de Fontes (IA)</Label>
                 </div>
                 <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleSuggestPlatforms}
                    disabled={isSuggesting || !campaignData.keywords || campaignData.keywords.length === 0}
                    className="border-[#00ffae] text-[#00ffae] hover:bg-[#00ffae]/10 h-8 text-xs"
                 >
                    {isSuggesting ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Sparkles className="w-3 h-3 mr-2" />}
                    {isSuggesting ? "BUSCANDO..." : "BUSCAR OPORTUNIDADES"}
                 </Button>
              </div>
              
              {suggestedPlatforms.length > 0 && (
                <div className="space-y-2 bg-[#050505] p-3 rounded border border-[#1f1f1f]">
                   <p className="text-xs text-[#10e6f6] mb-2">Baseado nas suas keywords, a IA encontrou:</p>
                   {suggestedPlatforms.map((platform, idx) => (
                     <div key={idx} className="flex items-center justify-between text-xs p-2 bg-[#0f0f0f] rounded hover:border-[#10e6f6] border border-transparent">
                        <div className="flex items-center gap-2 overflow-hidden">
                           <Globe className="w-3 h-3 text-[#10e6f6] flex-shrink-0" />
                           <span className="text-[#00ffae] truncate">{platform.name}</span>
                        </div>
                        <span className="text-[#10e6f6] ml-2 flex-shrink-0">DA: {platform.domain_authority}</span>
                     </div>
                   ))}
                </div>
              )}
            </div>

            {/* Templates Preview */}
            {templates.length > 0 && (
              <div className="pt-4 border-t border-[#1f1f1f]">
                <h3 className="font-bold text-[#00ffae] mb-3">Templates Disponíveis:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {templates.slice(0, 4).map((template) => (
                    <div
                      key={template.id}
                      className="p-3 bg-[#050505] rounded-lg border border-[#1f1f1f]"
                    >
                      <p className="font-bold text-[#00ffae] text-sm mb-1">{template.name}</p>
                      <p className="text-xs text-[#10e6f6] mb-2">{template.description}</p>
                      <div className="flex gap-3 text-xs">
                        <span className="text-[#10e6f6]">
                          Plataformas: <span className="text-[#00ffae]">{template.platform_count}</span>
                        </span>
                        <span className="text-[#10e6f6]">
                          Taxa: <span className="text-[#00ffae]">{template.success_rate}%</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "spinning" && (
          <ContentSpinningPreview 
            keywords={campaignData.keywords}
            targetUrl={campaignData.target_url}
          />
        )}

        {activeTab === "anchors" && (
          <AnchorVariationPreview 
            keywords={campaignData.keywords}
            targetUrl={campaignData.target_url}
          />
        )}

        {activeTab === "diagrams" && (
          <div className="space-y-6">
             <div>
                <Label className="text-[#10e6f6] mb-2">Selecione o Diagrama de Estratégia</Label>
                <Select
                  value={campaignData.seo_diagram || "diversity_power"}
                  onValueChange={(value) => setCampaignData({...campaignData, seo_diagram: value})}
                >
                  <SelectTrigger className="bg-[#050505] border-[#1f1f1f] text-[#00ffae]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f0f0f] border-[#1f1f1f]">
                    <SelectItem value="diamond_star">💎 Diamond Star - Autoridade Premium</SelectItem>
                    <SelectItem value="diversity_power">🛡️ Diversity Power - Perfil Natural</SelectItem>
                    <SelectItem value="pyramid_scheme">🔺 Pyramid Scheme - Crescimento Acelerado</SelectItem>
                    <SelectItem value="wheel_link">⚙️ Wheel Link - Rede Interconectada</SelectItem>
                    <SelectItem value="star_link">⭐ Star Link - Convergência Centralizada</SelectItem>
                  </SelectContent>
                </Select>
             </div>
             
             <SEODiagramPreview diagram={campaignData.seo_diagram || "diversity_power"} />
             
             <div className="p-4 bg-[rgba(0,255,174,0.05)] border border-[#00ffae] rounded-lg">
                <p className="text-sm text-[#00ffae] flex items-center gap-2 mb-3">
                   <Network className="w-4 h-4" />
                   <strong>Este diagrama criará automaticamente:</strong>
                </p>
                <ul className="text-xs text-[#10e6f6] space-y-1 ml-6 list-disc">
                  <li>Backlinks usando proxies rotativos para simular tráfego orgânico</li>
                  <li>Contas em plataformas Web 2.0, fóruns e blogs automaticamente</li>
                  <li>Artigos com spinning inteligente para cada backlink</li>
                  <li>Anchor texts variados seguindo a estratégia do diagrama</li>
                  <li>Indexação automática e monitoramento de qualidade</li>
                </ul>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
