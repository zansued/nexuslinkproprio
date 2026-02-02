import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Share2, Zap, TrendingUp, Target, Network, Star, Diamond, Pyramid, Grid, ExternalLink, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SEODiagramPreview from "@/components/campaign/SEODiagramPreview";

export default function SEODiagrams() {
  const navigate = useNavigate();
  const [selectedDiagram, setSelectedDiagram] = useState(null);

  const diagrams = [
    {
      id: "diversity_power",
      name: "Diversity Power",
      icon: Grid,
      rating: 5,
      description: "Estratégia balanceada de diversidade máxima de fontes e perfil natural de backlinks",
      strategy: "Diversidade Power",
      power: "Alta",
      speed: "Média",
      safety: "Muito Alta",
      bestFor: ["E-commerce", "Empresas", "Sites de autoridade"],
      features: [
        "Máxima diversidade de fontes",
        "Perfil natural de backlinks",
        "Anchor text variado",
        "Baixo risco de penalização"
      ],
      metrics: {
        backlinks: "50-100/semana",
        domains: "30-50 únicos",
        anchorVariety: "95%",
        contentTypes: "Web 2.0, Blogs, Forums, Directories"
      }
    },
    {
      id: "diamond_star",
      name: "Diamond Star",
      icon: Diamond,
      rating: 5,
      description: "Estratégia premium com foco em autoridade e qualidade através de links de alta DA",
      strategy: "Autoridade Premium",
      power: "Muito Alta",
      speed: "Lenta",
      safety: "Alta",
      bestFor: ["Sites corporativos", "E-commerce premium", "Marcas estabelecidas"],
      features: [
        "Foco em sites de alta DA",
        "Link building de qualidade",
        "Conteúdo premium otimizado",
        "Crescimento sustentável"
      ],
      metrics: {
        backlinks: "20-40/semana",
        domains: "DA 40+",
        anchorVariety: "90%",
        contentTypes: "Guest Posts, High-DA Web 2.0, Authority Blogs"
      }
    },
    {
      id: "pyramid_scheme",
      name: "Pyramid Scheme",
      icon: Pyramid,
      rating: 4,
      description: "Estrutura em camadas com tier 1, tier 2 e tier 3 para amplificação de autoridade",
      strategy: "Link Pyramid",
      power: "Muito Alta",
      speed: "Média-Rápida",
      safety: "Média",
      bestFor: ["Sites novos", "Campanhas agressivas", "Niches competitivos"],
      features: [
        "Estrutura em 3 níveis",
        "Amplificação de link juice",
        "Tier 2 e Tier 3 para suporte",
        "Crescimento acelerado"
      ],
      metrics: {
        backlinks: "100-200/semana",
        domains: "Tier 1: 10-20, Tier 2: 50+, Tier 3: 200+",
        anchorVariety: "85%",
        contentTypes: "Mixed (Web 2.0, Social, Forums, Profiles)"
      }
    },
    {
      id: "wheel_link",
      name: "Wheel Link",
      icon: Network,
      rating: 4,
      description: "Rede interconectada de backlinks para distribuição uniforme de autoridade",
      strategy: "Link Wheel",
      power: "Alta",
      speed: "Média",
      safety: "Média-Alta",
      bestFor: ["Blogs", "Sites de conteúdo", "Nichos específicos"],
      features: [
        "Links interconectados",
        "Distribuição de autoridade",
        "Rede de suporte mútuo",
        "Perfil orgânico"
      ],
      metrics: {
        backlinks: "60-100/semana",
        domains: "20-40 no wheel",
        anchorVariety: "90%",
        contentTypes: "Web 2.0, Blogs, Articles"
      }
    },
    {
      id: "star_link",
      name: "Star Link",
      icon: Star,
      rating: 5,
      description: "Estratégia centralizada com foco no money site com múltiplas fontes convergentes",
      strategy: "Star Centralized",
      power: "Alta",
      speed: "Rápida",
      safety: "Média-Alta",
      bestFor: ["Produtos específicos", "Landing pages", "Campanhas focadas"],
      features: [
        "Convergência para money site",
        "Múltiplas fontes variadas",
        "Anchor otimizado por fonte",
        "Velocidade controlada"
      ],
      metrics: {
        backlinks: "70-120/semana",
        domains: "40-60 únicos",
        anchorVariety: "88%",
        contentTypes: "Mixed, focus on relevance"
      }
    }
  ];

  const handleImportDiagram = (diagram) => {
    navigate(createPageUrl("NewCampaign") + `?diagram=${diagram.id}`);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Share2 className="w-8 h-8 text-[#00ffae]" style={{ transform: 'rotate(90deg)' }} />
          <h1 className="text-3xl font-bold glow-text text-[#00ffae]">
            > DIAGRAMAS_SEO_
          </h1>
        </div>

        <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-[#10e6f6] mt-0.5" />
            <div>
              <h3 className="font-bold text-[#00ffae] mb-2">Sobre os Diagramas SEO</h3>
              <p className="text-sm text-[#10e6f6] mb-2">
                Cada diagrama representa uma estratégia completa e testada de link building. 
                Eles automatizam a criação de backlinks, gerenciam proxies, criam contas e geram conteúdo otimizado.
              </p>
              <ul className="text-xs text-[#10e6f6] space-y-1 list-disc list-inside">
                <li>Criação automática de backlinks usando proxies rotativos</li>
                <li>Registro automático de contas em plataformas Web 2.0, fóruns, blogs</li>
                <li>Geração de artigos com spinning inteligente</li>
                <li>Anchor text otimizado e variado</li>
                <li>Monitoramento de indexação e qualidade</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {diagrams.map((diagram) => {
            const IconComponent = diagram.icon;
            return (
              <div
                key={diagram.id}
                className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-6 hover:border-[#00ffae] transition-all cursor-pointer group"
                onClick={() => setSelectedDiagram(selectedDiagram?.id === diagram.id ? null : diagram)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#050505] border border-[#00ffae] rounded-lg pulse-glow">
                      <IconComponent className="w-6 h-6 text-[#00ffae]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#00ffae]">{diagram.name}</h3>
                      <div className="flex gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < diagram.rating ? 'text-[#fbbf24] fill-[#fbbf24]' : 'text-gray-600'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleImportDiagram(diagram);
                    }}
                    className="bg-[#00ffae] text-[#050505] hover:bg-[#00cc8e] opacity-0 group-hover:opacity-100 transition-opacity"
                    size="sm"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Importar
                  </Button>
                </div>

                <p className="text-sm text-[#10e6f6] mb-4">{diagram.description}</p>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-2 bg-[#050505] rounded border border-[#1f1f1f]">
                    <p className="text-xs text-[#10e6f6] mb-1">Poder</p>
                    <p className="text-sm font-bold text-[#00ffae]">{diagram.power}</p>
                  </div>
                  <div className="text-center p-2 bg-[#050505] rounded border border-[#1f1f1f]">
                    <p className="text-xs text-[#10e6f6] mb-1">Velocidade</p>
                    <p className="text-sm font-bold text-[#10e6f6]">{diagram.speed}</p>
                  </div>
                  <div className="text-center p-2 bg-[#050505] rounded border border-[#1f1f1f]">
                    <p className="text-xs text-[#10e6f6] mb-1">Segurança</p>
                    <p className="text-sm font-bold text-[#00ffae]">{diagram.safety}</p>
                  </div>
                </div>

                {selectedDiagram?.id === diagram.id && (
                  <div className="mt-4 pt-4 border-t border-[#1f1f1f] space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-[#00ffae] mb-2">Melhor para:</h4>
                      <div className="flex flex-wrap gap-2">
                        {diagram.bestFor.map((item, idx) => (
                          <Badge key={idx} className="bg-[#00ffae]/20 text-[#00ffae] border border-[#00ffae]">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-[#00ffae] mb-2">Recursos:</h4>
                      <ul className="text-xs text-[#10e6f6] space-y-1">
                        {diagram.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <Zap className="w-3 h-3 text-[#00ffae]" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-[#00ffae] mb-2">Métricas:</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 bg-[#050505] rounded">
                          <p className="text-[#10e6f6]">Backlinks</p>
                          <p className="font-bold text-[#00ffae]">{diagram.metrics.backlinks}</p>
                        </div>
                        <div className="p-2 bg-[#050505] rounded">
                          <p className="text-[#10e6f6]">Domínios</p>
                          <p className="font-bold text-[#00ffae]">{diagram.metrics.domains}</p>
                        </div>
                        <div className="p-2 bg-[#050505] rounded">
                          <p className="text-[#10e6f6]">Anchor Variety</p>
                          <p className="font-bold text-[#00ffae]">{diagram.metrics.anchorVariety}</p>
                        </div>
                        <div className="p-2 bg-[#050505] rounded col-span-2">
                          <p className="text-[#10e6f6]">Tipos de Conteúdo</p>
                          <p className="font-bold text-[#00ffae]">{diagram.metrics.contentTypes}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <h4 className="text-sm font-bold text-[#00ffae] mb-3">Preview do Diagrama:</h4>
                      <SEODiagramPreview diagram={diagram.id} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
