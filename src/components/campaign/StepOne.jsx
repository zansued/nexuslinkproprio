import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, AlertCircle, Loader2, Globe } from "lucide-react";

export default function StepOne({ campaignData, setCampaignData }) {
  const [urlValidation, setUrlValidation] = useState({ status: 'idle', message: '' });
  const [nameValidation, setNameValidation] = useState({ status: 'idle', message: '' });

  useEffect(() => {
    // Validação de nome
    if (campaignData.name.length === 0) {
      setNameValidation({ status: 'idle', message: '' });
    } else if (campaignData.name.length < 3) {
      setNameValidation({ status: 'error', message: 'Mínimo 3 caracteres' });
    } else if (campaignData.name.length > 50) {
      setNameValidation({ status: 'error', message: 'Máximo 50 caracteres' });
    } else {
      setNameValidation({ status: 'success', message: 'Nome válido' });
    }
  }, [campaignData.name]);

  useEffect(() => {
    // Validação de URL
    if (campaignData.target_url.length === 0) {
      setUrlValidation({ status: 'idle', message: '' });
      return;
    }

    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    
    if (!urlPattern.test(campaignData.target_url)) {
      setUrlValidation({ status: 'error', message: 'URL inválida. Use formato: https://exemplo.com' });
    } else if (!campaignData.target_url.startsWith('http')) {
      setUrlValidation({ status: 'warning', message: 'Recomendado adicionar https://' });
    } else {
      setUrlValidation({ status: 'success', message: 'URL válida' });
    }
  }, [campaignData.target_url]);

  const getValidationIcon = (validation) => {
    switch(validation.status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-[#00ffae]" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-[#ef4444]" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-[#fbbf24]" />;
      default:
        return null;
    }
  };

  const getValidationColor = (validation) => {
    switch(validation.status) {
      case 'success':
        return '#00ffae';
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#fbbf24';
      default:
        return '#1f1f1f';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#00ffae] glow-text mb-6">
        > PASSO_01: INFORMAÇÕES_BÁSICAS_
      </h2>

      {/* Nome da Campanha */}
      <div>
        <Label className="text-[#10e6f6] mb-2 flex items-center gap-2">
          Nome da Campanha
          {nameValidation.status !== 'idle' && getValidationIcon(nameValidation)}
        </Label>
        <Input
          value={campaignData.name}
          onChange={(e) => setCampaignData({...campaignData, name: e.target.value})}
          placeholder="Ex: Campanha Principal 2024"
          className="bg-[#050505] text-[#00ffae]"
          style={{ borderColor: getValidationColor(nameValidation) }}
        />
        {nameValidation.message && (
          <p className={`text-xs mt-1`} style={{ color: getValidationColor(nameValidation) }}>
            {nameValidation.message}
          </p>
        )}
        <p className="text-xs text-[#10e6f6] mt-1 opacity-70">
          {campaignData.name.length}/50 caracteres
        </p>
      </div>

      {/* URL Alvo */}
      <div>
        <Label className="text-[#10e6f6] mb-2 flex items-center gap-2">
          URL Alvo
          {urlValidation.status !== 'idle' && getValidationIcon(urlValidation)}
        </Label>
        <div className="relative">
          <Input
            value={campaignData.target_url}
            onChange={(e) => setCampaignData({...campaignData, target_url: e.target.value})}
            placeholder="https://seu-site.com"
            className="bg-[#050505] text-[#00ffae] pl-10"
            style={{ borderColor: getValidationColor(urlValidation) }}
          />
          <Globe className="w-4 h-4 text-[#10e6f6] absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        {urlValidation.message && (
          <p className={`text-xs mt-1`} style={{ color: getValidationColor(urlValidation) }}>
            {urlValidation.message}
          </p>
        )}
        {urlValidation.status === 'success' && (
          <div className="mt-3 p-3 bg-[rgba(0,255,174,0.05)] border border-[#00ffae] rounded-lg">
            <p className="text-xs text-[#00ffae] mb-1">✓ URL verificada com sucesso</p>
            <p className="text-xs text-[#10e6f6]">Pronto para criar backlinks para este domínio</p>
          </div>
        )}
      </div>

      {/* Dicas */}
      <div className="p-4 bg-[#050505] border border-[#1f1f1f] rounded-lg">
        <h3 className="text-sm font-bold text-[#10e6f6] mb-2">💡 DICAS:</h3>
        <ul className="text-xs text-[#10e6f6] space-y-1">
          <li>• Use um nome descritivo para facilitar a organização</li>
          <li>• Certifique-se de que a URL está acessível publicamente</li>
          <li>• URLs com HTTPS têm melhor performance em SEO</li>
        </ul>
      </div>
    </div>
  );
}
