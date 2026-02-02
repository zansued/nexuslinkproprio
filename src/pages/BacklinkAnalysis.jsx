import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, Loader2, ShieldAlert, TrendingUp, AlertTriangle, 
  CheckCircle2, XCircle, Download, Target, Hash, Globe, Filter, ArrowUpDown, History, Clock, Save 
} from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function BacklinkAnalysis() {
  const [analysisMode, setAnalysisMode] = useState("url");
  const [targetUrl, setTargetUrl] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisNotes, setAnalysisNotes] = useState("");
  
  // Table state
  const [sortConfig, setSortConfig] = useState({ key: 'created_date', direction: 'desc' });
  const [statusFilter, setStatusFilter] = useState('all');

  const queryClient = useQueryClient();

  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => base44.entities.Campaign.list(),
    initialData: [],
  });

  const { data: backlinks = [] } = useQuery({
    queryKey: ['backlinks', analysisMode, targetUrl, selectedCampaign],
    queryFn: async () => {
        if (analysisMode === 'campaign' && selectedCampaign) {
            return base44.entities.Backlink.filter({ campaign_id: selectedCampaign });
        } else if (analysisMode === 'url' && targetUrl) {
            return base44.entities.Backlink.filter({ target_url: targetUrl });
        }
        return [];
    },
    enabled: !!(selectedCampaign || targetUrl),
    initialData: []
  });

  const { data: analysisHistory = [] } = useQuery({
    queryKey: ['campaign-analysis', selectedCampaign],
    queryFn: async () => {
        if (analysisMode === 'campaign' && selectedCampaign) {
            return base44.entities.CampaignAnalysis.filter({ campaign_id: selectedCampaign }, '-created_date');
        }
        return [];
    },
    enabled: analysisMode === 'campaign' && !!selectedCampaign,
    initialData: []
  });

  const sortedBacklinks = React.useMemo(() => {
    let result = [...backlinks];
    if (statusFilter !== 'all') {
        result = result.filter(b => b.status === statusFilter);
    }
    return result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });
  }, [backlinks, sortConfig, statusFilter]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleAnalyze = async () => {
    if (!targetUrl && !selectedCampaign) return;

    setIsAnalyzing(true);
    try {
      const result = await base44.functions.invoke('analyzeBacklinks', {
        target_url: analysisMode === "url" ? targetUrl : undefined,
        campaign_id: analysisMode === "campaign" ? selectedCampaign : undefined
      });
      setAnalysis(result.data);
      setAnalysisNotes("");
    } catch (error) {
      console.error("Erro na análise:", error);
      toast.error("Erro ao analisar backlinks");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveAnalysisMutation = useMutation({
    mutationFn: async () => {
      if (!analysis?.analysis) return;
      
      return await base44.entities.CampaignAnalysis.create({
        campaign_id: selectedCampaign || null,
        target_url: targetUrl || null,
        overall_health_score: analysis.analysis.overall_health_score || 0,
        anchor_diversity_score: analysis.analysis.anchor_diversity?.score || 0,
        domain_authority_score: analysis.analysis.domain_authority?.score || 0,
        pbn_risk_score: analysis.analysis.pbn_risk?.risk_score || 0,
        toxic_links_count: analysis.analysis.toxic_links?.length || 0,
        backlinks_analyzed: analysis.backlinks_analyzed || 0,
        analysis_summary: analysisNotes || analysis.analysis.recommendations?.[0] || "Análise salva manualmente",
        full_analysis: analysis.analysis
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-analysis'] });
      toast.success("Análise salva com sucesso!");
      setAnalysisNotes("");
    },
    onError: (error) => {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar análise");
    }
  });

  const downloadDisavowFile = () => {
    if (!analysis?.analysis?.disavow_list) return;
    
    const content = analysis.analysis.disavow_list.map(url => `domain:${url}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'disavow.txt';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#00ffae';
    if (score >= 60) return '#fbbf24';
    return '#ef4444';
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'high': return '#ef4444';
      case 'medium': return '#fbbf24';
      case 'low': return '#10e6f6';
      default: return '#10e6f6';
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <ShieldAlert className="w-8 h-8 text-[#00ffae]" />
          <h1 className="text-3xl font-bold glow-text text-[#00ffae]">
            > ANÁLISE_DE_BACKLINKS_
          </h1>
        </div>

        {/* Analysis Form */}
        <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-6 mb-6">
          <div className="space-y-4">
            <div>
              <Label className="text-[#10e6f6] mb-2">Modo de Análise</Label>
              <Select value={analysisMode} onValueChange={setAnalysisMode}>
                <SelectTrigger className="bg-[#050505] border-[#1f1f1f] text-[#00ffae]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0f0f0f] border-[#1f1f1f]">
                  <SelectItem value="url">Analisar URL Específica</SelectItem>
                  <SelectItem value="campaign">Analisar Campanha</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {analysisMode === "url" ? (
              <div>
                <Label className="text-[#10e6f6] mb-2">URL Alvo</Label>
                <Input
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://seu-site.com"
                  className="bg-[#050505] border-[#1f1f1f] text-[#00ffae]"
                />
              </div>
            ) : (
              <div>
                <Label className="text-[#10e6f6] mb-2">Campanha</Label>
                <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                  <SelectTrigger className="bg-[#050505] border-[#1f1f1f] text-[#00ffae]">
                    <SelectValue placeholder="Selecione uma campanha" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f0f0f] border-[#1f1f1f]">
                    {campaigns.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || (!targetUrl && !selectedCampaign)}
              className="w-full bg-[#00ffae] text-[#050505] hover:bg-[#00cc8e] pulse-glow"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ANALISANDO COM IA...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  INICIAR ANÁLISE
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Analysis History */}
        {analysisMode === 'campaign' && selectedCampaign && analysisHistory.length > 0 && (
          <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-[#00ffae]" />
              <h2 className="text-xl font-bold text-[#00ffae]">HISTÓRICO DE ANÁLISES</h2>
              <Badge className="ml-2 bg-[#00ffae]/20 text-[#00ffae]">{analysisHistory.length} análises</Badge>
            </div>

            <div className="space-y-3">
              {analysisHistory.slice(0, 5).map((hist, idx) => (
                <div key={hist.id} className="flex items-center justify-between p-4 bg-[#050505] rounded border border-[#1f1f1f] hover:border-[#00ffae] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold" style={{ color: getScoreColor(hist.overall_health_score) }}>
                        {hist.overall_health_score}
                      </div>
                      <div className="text-xs text-[#10e6f6]">Health Score</div>
                    </div>
                    <div className="border-l border-[#1f1f1f] pl-4">
                      <div className="flex items-center gap-2 text-xs text-[#10e6f6] mb-1">
                        <Clock className="w-3 h-3" />
                        {new Date(hist.created_date).toLocaleDateString('pt-BR')} às {new Date(hist.created_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <p className="text-sm text-gray-300">{hist.analysis_summary}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs border-[#00ffae] text-[#00ffae]">
                          {hist.backlinks_analyzed} backlinks
                        </Badge>
                        {hist.toxic_links_count > 0 && (
                          <Badge variant="outline" className="text-xs border-red-500 text-red-500">
                            {hist.toxic_links_count} tóxicos
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="text-sm font-bold text-[#00ffae]">{hist.anchor_diversity_score}</div>
                      <div className="text-xs text-[#10e6f6]">Anchor</div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#00ffae]">{hist.domain_authority_score}</div>
                      <div className="text-xs text-[#10e6f6]">DA</div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-red-500">{hist.pbn_risk_score}</div>
                      <div className="text-xs text-[#10e6f6]">PBN Risk</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && !analysis.analysis && (
            <div className="bg-[#0f0f0f] border border-yellow-900/50 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-3 text-yellow-500">
                    <AlertTriangle className="w-5 h-5" />
                    <p>{analysis.message || "A análise foi concluída mas não retornou dados detalhados. Tente novamente."}</p>
                </div>
            </div>
        )}

        {analysis && analysis.pending_jobs > 0 && (
            <div className="bg-[#0f0f0f] border border-[#00ffae] rounded-lg p-6 mb-6 pulse-glow">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#00ffae]/10 rounded-full">
                        <Loader2 className="w-8 h-8 text-[#00ffae] animate-spin" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-[#00ffae]">Campanha em Processamento</h3>
                        <p className="text-[#10e6f6]">{analysis.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            Verifique o <span className="text-[#00ffae] cursor-pointer" onClick={() => window.location.href='/AutomationCenter'}>Centro de Automação</span> para acompanhar o progresso.
                        </p>
                    </div>
                </div>
            </div>
        )}

        {analysis && analysis.analysis && (analysis.backlinks_analyzed > 0 || analysis.pending_jobs === 0) && (
          <div className="space-y-6">
            {/* Overall Health Score with Save Button */}
            <div className="bg-[#0f0f0f] border-2 rounded-lg p-6" style={{ borderColor: getScoreColor(analysis?.analysis?.overall_health_score || 0) }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#00ffae]">SAÚDE GERAL DO PERFIL</h2>
                <div className="text-right">
                  <p className="text-4xl font-bold" style={{ color: getScoreColor(analysis?.analysis?.overall_health_score || 0) }}>
                    {analysis?.analysis?.overall_health_score || 0}
                  </p>
                  <p className="text-sm text-[#10e6f6]">{analysis.backlinks_analyzed} backlinks analisados</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#1f1f1f]">
                <Label className="text-[#10e6f6] mb-2">Notas da Análise (opcional)</Label>
                <Textarea
                  value={analysisNotes}
                  onChange={(e) => setAnalysisNotes(e.target.value)}
                  placeholder="Adicione observações ou notas sobre esta análise..."
                  className="bg-[#050505] border-[#1f1f1f] text-[#00ffae] mb-3"
                  rows={2}
                />
                <Button
                  onClick={() => saveAnalysisMutation.mutate()}
                  disabled={saveAnalysisMutation.isPending}
                  className="bg-[#00ffae] text-[#050505] hover:bg-[#00cc8e]"
                >
                  {saveAnalysisMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      SALVANDO...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      SALVAR ANÁLISE
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Anchor Diversity Chart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Hash className="w-5 h-5 text-[#00ffae]" />
                    <h3 className="text-lg font-bold text-[#00ffae]">Diversidade de Anchor Text</h3>
                    <span className="ml-auto text-2xl font-bold" style={{ color: getScoreColor(analysis?.analysis?.anchor_diversity?.score || 0) }}>
                      {analysis?.analysis?.anchor_diversity?.score || 0}
                    </span>
                  </div>

                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={[
                                    { name: 'Exact', value: analysis?.analysis?.anchor_diversity?.distribution?.exact_match || 0 },
                                    { name: 'Partial', value: analysis?.analysis?.anchor_diversity?.distribution?.partial_match || 0 },
                                    { name: 'Branded', value: analysis?.analysis?.anchor_diversity?.distribution?.branded || 0 },
                                    { name: 'Generic', value: analysis?.analysis?.anchor_diversity?.distribution?.generic || 0 },
                                    { name: 'Naked', value: analysis?.analysis?.anchor_diversity?.distribution?.naked_url || 0 },
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                <Cell fill="#00ffae" />
                                <Cell fill="#10e6f6" />
                                <Cell fill="#fbbf24" />
                                <Cell fill="#a855f7" />
                                <Cell fill="#ef4444" />
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0f0f0f', border: '1px solid #1f1f1f' }}
                                itemStyle={{ color: '#00ffae' }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {analysis?.analysis?.anchor_diversity?.warnings?.length > 0 && (
                    <div className="space-y-1 mt-4">
                      {analysis.analysis.anchor_diversity.warnings.map((warning, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-[#fbbf24]">
                          <AlertTriangle className="w-4 h-4 mt-0.5" />
                          <span>{warning}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Domain Authority Chart */}
                <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-[#00ffae]" />
                    <h3 className="text-lg font-bold text-[#00ffae]">Perfil de Domain Authority</h3>
                    <span className="ml-auto text-2xl font-bold" style={{ color: getScoreColor(analysis?.analysis?.domain_authority?.score || 0) }}>
                      {analysis?.analysis?.domain_authority?.score || 0}
                    </span>
                  </div>

                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={[
                                { name: 'Alto (60+)', count: analysis?.analysis?.domain_authority?.high_da_count || 0 },
                                { name: 'Médio (30-60)', count: analysis?.analysis?.domain_authority?.medium_da_count || 0 },
                                { name: 'Baixo (<30)', count: analysis?.analysis?.domain_authority?.low_da_count || 0 },
                            ]}
                        >
                            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                            <YAxis stroke="#6b7280" fontSize={12} />
                            <Tooltip 
                                cursor={{fill: '#1f1f1f'}}
                                contentStyle={{ backgroundColor: '#0f0f0f', border: '1px solid #1f1f1f' }}
                                itemStyle={{ color: '#00ffae' }}
                            />
                            <Bar dataKey="count" fill="#00ffae" radius={[4, 4, 0, 0]}>
                                <Cell fill="#00ffae" />
                                <Cell fill="#fbbf24" />
                                <Cell fill="#ef4444" />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="flex justify-between mt-4 px-4">
                        <div className="text-center">
                            <p className="text-xs text-[#10e6f6] uppercase">Média DA</p>
                            <p className="text-xl font-bold text-[#00ffae]">{analysis?.analysis?.domain_authority?.average_da || 0}</p>
                        </div>
                         <div className="text-center">
                            <p className="text-xs text-[#10e6f6] uppercase">Qualidade</p>
                            <p className="text-xl font-bold" style={{ color: getScoreColor(analysis?.analysis?.domain_authority?.score || 0) }}>
                                {(analysis?.analysis?.domain_authority?.score || 0) >= 70 ? 'Excelente' : (analysis?.analysis?.domain_authority?.score || 0) >= 40 ? 'Média' : 'Baixa'}
                            </p>
                        </div>
                  </div>
                </div>
            </div>

            {/* Removed old DA section as it's now in the chart grid above */}

            {/* PBN Risk */}
            <div className="bg-[#0f0f0f] border rounded-lg p-6" style={{ borderColor: (analysis?.analysis?.pbn_risk?.risk_score || 0) > 50 ? '#ef4444' : '#1f1f1f' }}>
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="w-5 h-5 text-[#ef4444]" />
                <h3 className="text-lg font-bold text-[#00ffae]">Risco de PBN</h3>
                <span className="ml-auto text-2xl font-bold text-[#ef4444]">
                  {analysis?.analysis?.pbn_risk?.risk_score || 0}
                </span>
              </div>

              {analysis?.analysis?.pbn_risk?.risk_factors?.length > 0 && (
                <div className="mb-4 space-y-1">
                  {analysis.analysis.pbn_risk.risk_factors.map((factor, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-[#10e6f6]">
                      <XCircle className="w-4 h-4 mt-0.5 text-[#ef4444]" />
                      <span>{factor}</span>
                    </div>
                  ))}
                </div>
              )}

              {analysis?.analysis?.pbn_risk?.suspicious_domains?.length > 0 && (
                <div>
                  <p className="text-sm font-bold text-[#10e6f6] mb-2">Domínios Suspeitos:</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.analysis.pbn_risk.suspicious_domains.map((domain, idx) => (
                      <span key={idx} className="px-2 py-1 text-xs bg-[rgba(239,68,68,0.1)] border border-[#ef4444] text-[#ef4444] rounded">
                        {domain}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Toxic Links */}
            {analysis?.analysis?.toxic_links?.length > 0 && (
              <div className="bg-[#0f0f0f] border border-[#ef4444] rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-[#ef4444]" />
                    <h3 className="text-lg font-bold text-[#00ffae]">Links Tóxicos Detectados</h3>
                  </div>
                  <Button
                    onClick={downloadDisavowFile}
                    className="bg-[#ef4444] text-white hover:bg-[#dc2626]"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Disavow File
                  </Button>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {analysis.analysis.toxic_links.map((link, idx) => (
                    <div key={idx} className="p-3 bg-[#050505] rounded border" style={{ borderColor: getSeverityColor(link.severity) }}>
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-mono text-sm text-[#00ffae] break-all">{link.url}</p>
                        <span className="text-xs px-2 py-1 rounded ml-2" style={{ 
                          background: `${getSeverityColor(link.severity)}22`,
                          color: getSeverityColor(link.severity),
                          border: `1px solid ${getSeverityColor(link.severity)}`
                        }}>
                          {link.severity}
                        </span>
                      </div>
                      <p className="text-xs text-[#10e6f6]">{link.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-[#00ffae]" />
                <h3 className="text-lg font-bold text-[#00ffae]">Recomendações Priorizadas</h3>
              </div>

              <div className="space-y-3">
                {(Array.isArray(analysis?.analysis?.recommendations) ? analysis.analysis.recommendations : []).map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-[#050505] rounded border border-[#1f1f1f] hover:border-[#00ffae] transition-colors">
                    <div className={`mt-0.5 ${idx === 0 ? 'text-[#ef4444]' : idx < 3 ? 'text-[#fbbf24]' : 'text-[#00ffae]'}`}>
                         {idx === 0 ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-[#10e6f6] mb-1">
                            {idx === 0 ? 'Prioridade Alta' : idx < 3 ? 'Sugestão Importante' : 'Otimização'}
                        </p>
                        <span className="text-sm text-gray-300">{rec}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Backlinks Table */}
            <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-[#00ffae]" />
                        <h3 className="text-lg font-bold text-[#00ffae]">Lista de Backlinks ({backlinks.length})</h3>
                    </div>
                    <div className="flex items-center gap-3">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-32 bg-[#050505] border-[#1f1f1f] text-[#10e6f6] h-8">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0f0f0f] border-[#1f1f1f]">
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="indexed">Indexed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="rounded-md border border-[#1f1f1f] overflow-hidden">
                    <Table>
                        <TableHeader className="bg-[#050505]">
                            <TableRow className="border-[#1f1f1f] hover:bg-[#050505]">
                                <TableHead className="text-[#00ffae] cursor-pointer" onClick={() => requestSort('source_url')}>
                                    <div className="flex items-center gap-1">Source URL <ArrowUpDown className="w-3 h-3" /></div>
                                </TableHead>
                                <TableHead className="text-[#00ffae] cursor-pointer" onClick={() => requestSort('anchor_text')}>
                                    <div className="flex items-center gap-1">Anchor <ArrowUpDown className="w-3 h-3" /></div>
                                </TableHead>
                                <TableHead className="text-[#00ffae] cursor-pointer" onClick={() => requestSort('domain_authority')}>
                                    <div className="flex items-center gap-1">DA <ArrowUpDown className="w-3 h-3" /></div>
                                </TableHead>
                                <TableHead className="text-[#00ffae]">Status</TableHead>
                                <TableHead className="text-[#00ffae]">Indexed</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedBacklinks.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                                        Nenhum backlink encontrado com os filtros atuais.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sortedBacklinks.map((link) => (
                                    <TableRow key={link.id} className="border-[#1f1f1f] hover:bg-[#050505]/50 transition-colors">
                                        <TableCell className="font-mono text-xs text-[#10e6f6]">
                                            <a href={link.source_url} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-[#00ffae]">
                                                {link.source_url}
                                            </a>
                                        </TableCell>
                                        <TableCell className="text-gray-300 text-xs">{link.anchor_text}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`${link.domain_authority > 50 ? 'border-[#00ffae] text-[#00ffae]' : 'border-gray-700 text-gray-500'}`}>
                                                {link.domain_authority || 0}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={
                                                link.status === 'active' ? 'bg-[#00ffae]/20 text-[#00ffae]' :
                                                link.status === 'indexed' ? 'bg-blue-500/20 text-blue-500' :
                                                'bg-yellow-500/20 text-yellow-500'
                                            }>
                                                {link.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {link.indexed ? 
                                                <CheckCircle2 className="w-4 h-4 text-[#00ffae]" /> : 
                                                <XCircle className="w-4 h-4 text-gray-700" />
                                            }
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
