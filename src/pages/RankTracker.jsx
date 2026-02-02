import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Plus, Search, ArrowUp, ArrowDown, Minus, RefreshCw } from "lucide-react";
import { format } from "date-fns";

export default function RankTracker() {
  const [newKeyword, setNewKeyword] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const queryClient = useQueryClient();

  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => base44.entities.Campaign.list(),
    initialData: [],
  });

  const { data: rankings = [], isLoading } = useQuery({
    queryKey: ['rankings'],
    queryFn: () => base44.entities.KeywordRanking.list("-check_date"),
    initialData: [],
  });

  const addKeywordMutation = useMutation({
    mutationFn: (data) => base44.entities.KeywordRanking.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['rankings']);
      setNewKeyword("");
    }
  });

  const updateRankingsMutation = useMutation({
    mutationFn: () => base44.functions.invoke('checkKeywordRankings'),
    onSuccess: () => {
      queryClient.invalidateQueries(['rankings']);
    }
  });

  const handleAddKeyword = () => {
    if (!newKeyword || !selectedCampaign) return;
    addKeywordMutation.mutate({
      keyword: newKeyword,
      campaign_id: selectedCampaign,
      rank: 0,
      search_engine: 'google',
      check_date: new Date().toISOString()
    });
  };

  const getRankChangeIcon = (current, previous) => {
    if (!previous || previous === 0) return <Minus className="w-4 h-4 text-gray-500" />;
    if (current === 0) return <ArrowDown className="w-4 h-4 text-red-500" />;
    if (current < previous) return <ArrowUp className="w-4 h-4 text-[#00ffae]" />; // Lower number is better
    if (current > previous) return <ArrowDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getCampaignName = (id) => {
    return campaigns.find(c => c.id === id)?.name || 'Unknown Campaign';
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-[#00ffae]" />
            <div>
              <h1 className="text-3xl font-bold glow-text text-[#00ffae]">
                > RANK_TRACKER_
              </h1>
              <p className="text-sm text-[#10e6f6]">
                Monitoramento de posições em tempo real (SERP)
              </p>
            </div>
          </div>
          <Button
            onClick={() => updateRankingsMutation.mutate()}
            disabled={updateRankingsMutation.isPending}
            className="bg-[#1f1f1f] border border-[#00ffae] text-[#00ffae] hover:bg-[#00ffae]/10"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${updateRankingsMutation.isPending ? 'animate-spin' : ''}`} />
            Atualizar Rankings
          </Button>
        </div>

        {/* Add Keyword Box */}
        <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-6 mb-8">
          <h2 className="text-lg font-bold text-[#00ffae] mb-4">Adicionar Rastreamento</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/3">
              <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                <SelectTrigger className="bg-[#050505] border-[#1f1f1f] text-[#00ffae]">
                  <SelectValue placeholder="Selecione a Campanha" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f0f0f] border-[#1f1f1f]">
                  {campaigns.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Input
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Palavra-chave para monitorar..."
                className="bg-[#050505] border-[#1f1f1f] text-[#00ffae]"
              />
            </div>
            <Button 
              onClick={handleAddKeyword}
              disabled={!newKeyword || !selectedCampaign || addKeywordMutation.isPending}
              className="bg-[#00ffae] text-[#050505] hover:bg-[#00cc8e]"
            >
              <Plus className="w-4 h-4 mr-2" /> Rastrear
            </Button>
          </div>
        </div>

        {/* Rankings Table */}
        <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#1f1f1f] bg-[#050505]">
                <th className="p-4 text-[#10e6f6] font-medium">Palavra-chave</th>
                <th className="p-4 text-[#10e6f6] font-medium">Campanha</th>
                <th className="p-4 text-[#10e6f6] font-medium text-center">Posição Atual</th>
                <th className="p-4 text-[#10e6f6] font-medium text-center">Mudança</th>
                <th className="p-4 text-[#10e6f6] font-medium">Melhor URL</th>
                <th className="p-4 text-[#10e6f6] font-medium text-right">Última Checagem</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((ranking) => (
                <tr key={ranking.id} className="border-b border-[#1f1f1f] hover:bg-[#1f1f1f]/30 transition-colors">
                  <td className="p-4 font-bold text-[#00ffae]">{ranking.keyword}</td>
                  <td className="p-4 text-sm text-gray-400">{getCampaignName(ranking.campaign_id)}</td>
                  <td className="p-4 text-center">
                    <Badge variant="outline" className={`text-lg font-mono border-0 ${ranking.rank > 0 && ranking.rank <= 10 ? 'text-[#00ffae]' : 'text-white'}`}>
                      {ranking.rank > 0 ? ranking.rank : '-'}
                    </Badge>
                  </td>
                  <td className="p-4 text-center flex justify-center items-center h-full">
                    {getRankChangeIcon(ranking.rank, ranking.previous_rank)}
                  </td>
                  <td className="p-4 text-xs text-[#10e6f6] truncate max-w-[200px]" title={ranking.url_found}>
                    {ranking.url_found || 'N/A'}
                  </td>
                  <td className="p-4 text-right text-xs text-gray-500">
                    {ranking.check_date ? format(new Date(ranking.check_date), 'dd/MM HH:mm') : '-'}
                  </td>
                </tr>
              ))}
              {rankings.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Nenhuma palavra-chave sendo rastreada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
