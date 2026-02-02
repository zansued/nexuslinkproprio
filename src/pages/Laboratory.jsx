import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Zap, Plus, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Laboratory() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [backlinkData, setBacklinkData] = useState({
    campaign_id: "",
    source_url: "",
    target_url: "",
    anchor_text: "",
    platform_type: "other",
    status: "pending"
  });

  const { data: backlinks = [] } = useQuery({
    queryKey: ['backlinks'],
    queryFn: () => base44.entities.Backlink.list("-created_date"),
    initialData: [],
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => base44.entities.Campaign.list(),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Backlink.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backlinks'] });
      setShowForm(false);
      setBacklinkData({
        campaign_id: "",
        source_url: "",
        target_url: "",
        anchor_text: "",
        platform_type: "other",
        status: "pending"
      });
    },
  });

  const evaluateMutation = useMutation({
    mutationFn: async (id) => {
       const res = await base44.functions.invoke('evaluateBacklink', { backlinkId: id });
       return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backlinks'] });
    }
  });

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Zap className="w-8 h-8 text-[#00ffae]" />
          <h1 className="text-3xl font-bold glow-text text-[#00ffae]">
            > LABORATÓRIO_DE_LINKS_
          </h1>
        </div>

        <div className="flex justify-end mb-6">
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#00ffae] text-[#050505] pulse-glow"
          >
            <Plus className="w-4 h-4 mr-2" />
            NOVO BACKLINK
          </Button>
        </div>

        {showForm && (
          <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-[#00ffae] mb-4">> CRIAR_BACKLINK_</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-[#10e6f6] mb-2">Campanha</Label>
                <select
                  value={backlinkData.campaign_id}
                  onChange={(e) => setBacklinkData({...backlinkData, campaign_id: e.target.value})}
                  className="w-full p-2 bg-[#050505] border border-[#1f1f1f] rounded text-[#00ffae]"
                >
                  <option value="">Selecione uma campanha</option>
                  {campaigns.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-[#10e6f6] mb-2">URL de Origem</Label>
                <Input
                  value={backlinkData.source_url}
                  onChange={(e) => setBacklinkData({...backlinkData, source_url: e.target.value})}
                  placeholder="https://site-origem.com"
                  className="bg-[#050505] border-[#1f1f1f] text-[#00ffae]"
                />
              </div>
              <div>
                <Label className="text-[#10e6f6] mb-2">URL de Destino</Label>
                <Input
                  value={backlinkData.target_url}
                  onChange={(e) => setBacklinkData({...backlinkData, target_url: e.target.value})}
                  placeholder="https://seu-site.com"
                  className="bg-[#050505] border-[#1f1f1f] text-[#00ffae]"
                />
              </div>
              <div>
                <Label className="text-[#10e6f6] mb-2">Texto Âncora</Label>
                <Input
                  value={backlinkData.anchor_text}
                  onChange={(e) => setBacklinkData({...backlinkData, anchor_text: e.target.value})}
                  placeholder="palavra-chave"
                  className="bg-[#050505] border-[#1f1f1f] text-[#00ffae]"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => createMutation.mutate(backlinkData)}
                  className="bg-[#00ffae] text-[#050505]"
                >
                  CRIAR
                </Button>
                <Button
                  onClick={() => setShowForm(false)}
                  variant="outline"
                  className="border-[#10e6f6] text-[#10e6f6]"
                >
                  CANCELAR
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-6">
          <h2 className="text-xl font-bold text-[#00ffae] glow-text mb-6">
            > BACKLINKS_CRIADOS_
          </h2>
          <div className="space-y-3">
            {backlinks.map((backlink) => (
              <div
                key={backlink.id}
                className="p-4 bg-[#050505] rounded-lg border border-[#1f1f1f] hover:border-[#00ffae] transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-[#00ffae]">{backlink.anchor_text || 'Sem âncora'}</p>
                    <a
                      href={backlink.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#10e6f6] hover:underline flex items-center gap-1 mt-1"
                    >
                      {backlink.source_url}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline" className="border-[#10e6f6] text-[#10e6f6]">
                      {backlink.platform_type}
                    </Badge>
                    {backlink.quality_score && (
                       <Badge className={backlink.quality_score > 70 ? "bg-green-900 text-green-300" : "bg-yellow-900 text-yellow-300"}>
                          Score: {backlink.quality_score}
                       </Badge>
                    )}
                  </div>
                </div>

                {backlink.analysis_summary && (
                  <div className="mb-3 p-2 bg-[#0f0f0f] rounded border border-[#1f1f1f] text-xs text-gray-400">
                    <p className="text-[#00ffae] font-bold mb-1">Análise IA:</p>
                    {backlink.analysis_summary}
                  </div>
                )}

                <div className="flex justify-end mt-3 pt-2 border-t border-[#1f1f1f]">
                    <Button 
                       size="sm" 
                       variant="ghost" 
                       onClick={() => evaluateMutation.mutate(backlink.id)}
                       disabled={evaluateMutation.isPending}
                       className="text-[#10e6f6] hover:text-[#00ffae] h-6 text-xs"
                    >
                       {evaluateMutation.isPending ? "Analisando..." : (backlink.last_analyzed ? "Re-analisar" : "Analisar Qualidade")}
                    </Button>
                </div>
              </div>
            ))}
            {backlinks.length === 0 && (
              <p className="text-center py-8 text-[#10e6f6]">Nenhum backlink criado ainda</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
