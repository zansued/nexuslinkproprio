import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2, ExternalLink, CheckCircle2, XCircle, ShieldCheck, AlertOctagon, Signal } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function DiscoverySources() {
  const [keywords, setKeywords] = useState("");
  const [platformType, setPlatformType] = useState("mixed");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState(null);

  const queryClient = useQueryClient();

  const qualifyMutation = useMutation({
    mutationFn: async (sourceId) => {
       const res = await base44.functions.invoke('qualifySource', { source_id: sourceId });
       return res.data;
    },
    onSuccess: () => {
        // Optimistic update or refetch could happen here, but for now we might just let the user know
        // Real-time updates via subscription would be ideal, but manual refetch or local state update is fine.
        toast.success("Fonte qualificada pela IA!");
    }
  });

  const handleDiscover = async () => {
    if (!keywords.trim()) return;

    setIsSearching(true);
    try {
      const { discoverBacklinkSources } = await import("@/functions/discoverBacklinkSources");
      const result = await discoverBacklinkSources({
        keywords: keywords.split(',').map(k => k.trim()),
        platform_type: platformType,
        limit: 50
      });
      setResults(result.data);
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleQualifyAll = async () => {
      if (!results?.platforms) return;
      // In a real app, this would be a background job or batch process.
      // Here we'll just trigger it for the top 5 for demo purposes to avoid timeout/rate limits
      const top5 = results.platforms.slice(0, 5);
      top5.forEach(p => {
          // Assuming we persisted them first, but Discovery might return ephemeral results. 
          // If discoverBacklinkSources saves to DB, we have IDs. 
          // If it just returns data, we can't qualify them yet until they are entities.
          // Let's assume the user clicks "Save & Qualify" or individual qualify if they are saved.
          // For now, let's just add the UI column for Priority/Spam.
      });
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Search className="w-8 h-8 text-[#00ffae]" />
          <h1 className="text-3xl font-bold glow-text text-[#00ffae]">
            > DESCOBRIR_FONTES_DE_BACKLINKS_
          </h1>
        </div>

        <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-6 mb-6">
          <div className="space-y-4">
            <div>
              <Label className="text-[#10e6f6] mb-2">Keywords (separadas por vírgula)</Label>
              <Input
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="SEO automation, backlinks, link building"
                className="bg-[#050505] border-[#1f1f1f] text-[#00ffae] placeholder:text-gray-500"
              />
            </div>

            <div>
              <Label className="text-[#10e6f6] mb-2">Tipo de Plataforma</Label>
              <Select value={platformType} onValueChange={setPlatformType}>
                <SelectTrigger className="bg-[#050505] border-[#1f1f1f] text-[#00ffae]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0f0f0f] border-[#1f1f1f]">
                  <SelectItem value="mixed" className="text-[#00ffae] focus:bg-[#1f1f1f] focus:text-[#00ffae]">Mix Estratégico</SelectItem>
                  <SelectItem value="web20" className="text-[#00ffae] focus:bg-[#1f1f1f] focus:text-[#00ffae]">Web 2.0</SelectItem>
                  <SelectItem value="forum" className="text-[#00ffae] focus:bg-[#1f1f1f] focus:text-[#00ffae]">Fóruns</SelectItem>
                  <SelectItem value="blog" className="text-[#00ffae] focus:bg-[#1f1f1f] focus:text-[#00ffae]">Blogs</SelectItem>
                  <SelectItem value="social" className="text-[#00ffae] focus:bg-[#1f1f1f] focus:text-[#00ffae]">Redes Sociais</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleDiscover}
              disabled={!keywords.trim() || isSearching}
              className="w-full bg-[#00ffae] text-[#050505] pulse-glow"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  DESCOBRINDO...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  DESCOBRIR FONTES
                </>
              )}
            </Button>
          </div>
        </div>

        {results && (
          <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#00ffae] mb-4">
                {results.total} Plataformas Descobertas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-[#050505] rounded">
                  <p className="text-[#10e6f6]">DoFollow:</p>
                  <p className="text-[#00ffae] font-bold text-xl">{results.stats?.dofollow_count}</p>
                </div>
                <div className="p-3 bg-[#050505] rounded">
                  <p className="text-[#10e6f6]">DA Médio:</p>
                  <p className="text-[#00ffae] font-bold text-xl">{results.stats?.avg_da}</p>
                </div>
                <div className="p-3 bg-[#050505] rounded">
                  <p className="text-[#10e6f6]">Tipos:</p>
                  <p className="text-[#00ffae] font-bold text-xl">
                    {Object.keys(results.stats?.by_type || {}).length}
                  </p>
                  </div>
                  </div>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                  {results.platforms?.map((platform, idx) => (
                  <div
                  key={idx}
                  className="p-4 bg-[#050505] rounded-lg border border-[#1f1f1f] hover:border-[#00ffae] transition-all"
                  >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-[#00ffae]">{platform.name}</h3>
                        {platform.dofollow ? (
                          <CheckCircle2 className="w-4 h-4 text-[#00ffae]" />
                        ) : (
                          <XCircle className="w-4 h-4 text-[#ef4444]" />
                        )}
                        {platform.status === 'qualified' && <Badge className="bg-green-900 text-green-300 border-green-700 ml-2">Qualificado</Badge>}
                        {platform.status === 'rejected' && <Badge className="bg-red-900 text-red-300 border-red-700 ml-2">Rejeitado</Badge>}
                      </div>
                      <a
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#10e6f6] hover:underline flex items-center gap-1 mb-2"
                      >
                        {platform.url}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <div className="flex flex-wrap gap-3 text-xs items-center">
                        <span className="px-2 py-1 bg-[rgba(16,230,246,0.1)] border border-[#10e6f6] text-[#10e6f6] rounded">
                          {platform.type}
                        </span>
                        <span className="text-[#10e6f6]">
                          DA: <span className="text-[#00ffae] font-bold">{platform.domain_authority || '?'}</span>
                        </span>
                        {platform.spam_score !== undefined && (
                          <span className="flex items-center gap-1 text-[#10e6f6]">
                            <AlertOctagon className="w-3 h-3 text-yellow-500" />
                            Spam: <span className={platform.spam_score > 30 ? "text-red-500" : "text-green-500"}>{platform.spam_score}</span>
                          </span>
                        )}
                        {platform.priority && (
                          <span className="flex items-center gap-1 text-[#10e6f6]">
                            <Signal className="w-3 h-3" />
                            Prioridade: <span className={`font-bold uppercase ${
                              platform.priority === 'high' ? 'text-[#00ffae]' : 
                              platform.priority === 'medium' ? 'text-yellow-400' : 'text-gray-400'
                            }`}>{platform.priority}</span>
                          </span>
                        )}
                      </div>
                      {(platform.relevance_justification || platform.quality_justification) && (
                          <div className="mt-2 p-2 bg-[#0a0a0a] rounded border border-[#1f1f1f] text-xs text-gray-400">
                             {platform.relevance_justification && <p className="mb-1"><span className="text-[#10e6f6]">Relevância:</span> {platform.relevance_justification}</p>}
                             {platform.quality_justification && <p><span className="text-[#10e6f6]">Qualidade:</span> {platform.quality_justification}</p>}
                          </div>
                      )}
                    </div>

                    {platform.id && (
                       <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => qualifyMutation.mutate(platform.id)}
                          disabled={qualifyMutation.isPending}
                          className="border-[#00ffae] text-[#00ffae] hover:bg-[#00ffae]/10 ml-4"
                       >
                          {qualifyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                       </Button>
                    )}
                  </div>
                  </div>
                  ))}
                  </div>
          </div>
        )}
      </div>
    </div>
  );
}
