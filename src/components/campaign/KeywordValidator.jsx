import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";

export default function KeywordValidator({ keywords }) {
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    if (keywords.length === 0) {
      setAnalysis(null);
      return;
    }

    // Análise das keywords
    const avgLength = keywords.reduce((sum, k) => sum + k.length, 0) / keywords.length;
    const longTailCount = keywords.filter(k => k.split(' ').length >= 3).length;
    const shortTailCount = keywords.length - longTailCount;

    let status = 'success';
    let message = 'Ótima seleção de keywords!';
    let recommendations = [];

    if (keywords.length < 3) {
      status = 'warning';
      message = 'Adicione mais keywords para melhor cobertura';
      recommendations.push('Recomendado: 5-10 keywords para campanhas efetivas');
    } else if (keywords.length > 20) {
      status = 'warning';
      message = 'Muitas keywords podem diluir o foco';
      recommendations.push('Considere criar campanhas separadas por tema');
    }

    if (longTailCount === 0 && keywords.length > 0) {
      recommendations.push('Adicione keywords de cauda longa (3+ palavras) para melhor conversão');
    }

    if (avgLength < 5) {
      recommendations.push('Keywords muito curtas podem ter alta concorrência');
    }

    setAnalysis({
      status,
      message,
      recommendations,
      stats: {
        total: keywords.length,
        shortTail: shortTailCount,
        longTail: longTailCount,
        avgLength: avgLength.toFixed(1)
      }
    });
  }, [keywords]);

  if (!analysis) return null;

  const statusColors = {
    success: '#00ffae',
    warning: '#fbbf24',
    error: '#ef4444'
  };

  return (
    <div className="p-4 bg-[#050505] border rounded-lg" style={{ borderColor: statusColors[analysis.status] }}>
      <div className="flex items-start gap-3 mb-3">
        {analysis.status === 'success' ? (
          <CheckCircle2 className="w-5 h-5 mt-0.5" style={{ color: statusColors[analysis.status] }} />
        ) : (
          <AlertCircle className="w-5 h-5 mt-0.5" style={{ color: statusColors[analysis.status] }} />
        )}
        <div className="flex-1">
          <p className="font-bold text-sm" style={{ color: statusColors[analysis.status] }}>
            {analysis.message}
          </p>
          {analysis.recommendations.length > 0 && (
            <ul className="text-xs text-[#10e6f6] mt-2 space-y-1">
              {analysis.recommendations.map((rec, idx) => (
                <li key={idx}>• {rec}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 pt-3 border-t border-[#1f1f1f]">
        <div>
          <p className="text-xs text-[#10e6f6]">Total</p>
          <p className="text-lg font-bold text-[#00ffae]">{analysis.stats.total}</p>
        </div>
        <div>
          <p className="text-xs text-[#10e6f6]">Cauda Curta</p>
          <p className="text-lg font-bold text-[#00ffae]">{analysis.stats.shortTail}</p>
        </div>
        <div>
          <p className="text-xs text-[#10e6f6]">Cauda Longa</p>
          <p className="text-lg font-bold text-[#00ffae]">{analysis.stats.longTail}</p>
        </div>
        <div>
          <p className="text-xs text-[#10e6f6]">Média Chars</p>
          <p className="text-lg font-bold text-[#00ffae]">{analysis.stats.avgLength}</p>
        </div>
      </div>
    </div>
  );
}
