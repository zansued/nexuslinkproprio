import React from 'react';
import { CheckCircle2, Target, Hash, Settings, Sparkles, RefreshCw, Link2 } from "lucide-react";

export default function CampaignSummary({ campaignData }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#00ffae] glow-text mb-6">
        > RESUMO_FINAL_
      </h2>

      <div className="p-4 bg-[rgba(0,255,174,0.05)] border-2 border-[#00ffae] rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-6 h-6 text-[#00ffae]" />
          <h3 className="text-lg font-bold text-[#00ffae]">Campanha Pronta para Iniciar</h3>
        </div>
        <p className="text-sm text-[#10e6f6]">
          Tudo configurado! Ao clicar em "INICIAR", a IA começará a criar backlinks automaticamente.
        </p>
      </div>

      {/* Informações Básicas */}
      <div className="space-y-3">
        <h3 className="font-bold text-[#10e6f6] flex items-center gap-2">
          <Target className="w-4 h-4" />
          INFORMAÇÕES BÁSICAS
        </h3>
        <div className="bg-[#050505] p-4 rounded-lg border border-[#1f1f1f] space-y-2">
          <div className="flex justify-between">
            <span className="text-[#10e6f6]">Nome:</span>
            <span className="text-[#00ffae] font-bold">{campaignData.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#10e6f6]">URL Alvo:</span>
            <a 
              href={campaignData.target_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00ffae] hover:underline font-mono text-sm"
            >
              {campaignData.target_url}
            </a>
          </div>
        </div>
      </div>

      {/* Keywords */}
      <div className="space-y-3">
        <h3 className="font-bold text-[#10e6f6] flex items-center gap-2">
          <Hash className="w-4 h-4" />
          KEYWORDS ({campaignData.keywords.length})
        </h3>
        <div className="bg-[#050505] p-4 rounded-lg border border-[#1f1f1f]">
          <div className="flex flex-wrap gap-2">
            {campaignData.keywords.slice(0, 10).map((keyword, idx) => (
              <span
                key={idx}
                className="px-2 py-1 text-xs bg-[rgba(0,255,174,0.1)] border border-[#00ffae] text-[#00ffae] rounded"
              >
                {keyword}
              </span>
            ))}
            {campaignData.keywords.length > 10 && (
              <span className="px-2 py-1 text-xs text-[#10e6f6]">
                +{campaignData.keywords.length - 10} mais
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Configurações */}
      <div className="space-y-3">
        <h3 className="font-bold text-[#10e6f6] flex items-center gap-2">
          <Settings className="w-4 h-4" />
          CONFIGURAÇÕES
        </h3>
        <div className="bg-[#050505] p-4 rounded-lg border border-[#1f1f1f] space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[#10e6f6]">Meta de Backlinks:</span>
            <span className="text-[#00ffae] font-bold text-lg">{campaignData.backlinks_target}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#10e6f6]">Tipo de Template:</span>
            <span className="text-[#00ffae] font-bold capitalize">{campaignData.template_type}</span>
          </div>
        </div>
      </div>

      {/* IA Features */}
      <div className="space-y-3">
        <h3 className="font-bold text-[#10e6f6] flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          AUTOMAÇÕES DE IA
        </h3>
        <div className="bg-[#050505] p-4 rounded-lg border border-[#1f1f1f] space-y-3">
          <div className="flex items-start gap-3">
            {campaignData.auto_spinning ? (
              <CheckCircle2 className="w-5 h-5 text-[#00ffae] mt-0.5" />
            ) : (
              <div className="w-5 h-5 rounded border border-[#1f1f1f] mt-0.5" />
            )}
            <div>
              <p className="font-bold text-[#00ffae] text-sm flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Rotação Automática de Conteúdo
              </p>
              <p className="text-xs text-[#10e6f6] mt-1">
                A IA gerará variações únicas do conteúdo para cada backlink
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            {campaignData.anchor_variation ? (
              <CheckCircle2 className="w-5 h-5 text-[#00ffae] mt-0.5" />
            ) : (
              <div className="w-5 h-5 rounded border border-[#1f1f1f] mt-0.5" />
            )}
            <div>
              <p className="font-bold text-[#00ffae] text-sm flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Variação de Âncoras
              </p>
              <p className="text-xs text-[#10e6f6] mt-1">
                A IA criará anchor texts variados seguindo as melhores práticas de SEO
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Estimativas */}
      <div className="p-4 bg-[#050505] border border-[#10e6f6] rounded-lg">
        <h3 className="font-bold text-[#10e6f6] mb-3">📊 ESTIMATIVAS</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[#10e6f6]">Tempo estimado:</p>
            <p className="text-[#00ffae] font-bold">
              {Math.ceil(campaignData.backlinks_target / 10)} minutos
            </p>
          </div>
          <div>
            <p className="text-[#10e6f6]">Taxa de sucesso:</p>
            <p className="text-[#00ffae] font-bold">70-85%</p>
          </div>
          <div>
            <p className="text-[#10e6f6]">Variações de conteúdo:</p>
            <p className="text-[#00ffae] font-bold">
              ~{Math.min(campaignData.backlinks_target, 15)}
            </p>
          </div>
          <div>
            <p className="text-[#10e6f6]">Variações de âncoras:</p>
            <p className="text-[#00ffae] font-bold">
              ~{Math.min(campaignData.backlinks_target, 20)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
