import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Terminal, Rocket, Activity, Link2, CheckCircle2, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import CampaignCard from "@/components/campaign/CampaignCard";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => base44.entities.Campaign.list("-created_date"),
    initialData: [],
  });

  const { data: backlinks = [] } = useQuery({
    queryKey: ['backlinks'],
    queryFn: () => base44.entities.Backlink.list("-created_date"),
    initialData: [],
  });

  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const totalBacklinks = backlinks.length;
  const indexedBacklinks = backlinks.filter(b => b.indexed).length;
  const avgDA = campaigns.length > 0 
    ? campaigns.reduce((sum, c) => sum + (c.domain_authority || 0), 0) / campaigns.length 
    : 0;

  // Calculate Avg Quality Score
  const analyzedBacklinks = backlinks.filter(b => b.quality_score !== undefined && b.quality_score !== null);
  const avgQuality = analyzedBacklinks.length > 0
    ? analyzedBacklinks.reduce((sum, b) => sum + b.quality_score, 0) / analyzedBacklinks.length
    : 0;

  const stats = [
    { title: "Campanhas Ativas", value: activeCampaigns, icon: Activity, color: "#00ffae" },
    { title: "Total Backlinks", value: totalBacklinks, icon: Link2, color: "#10e6f6" },
    { title: "Qualidade Média (IA)", value: avgQuality.toFixed(1), icon: Sparkles, color: "#d946ef" }, // Changed from Indexed to Quality for variety or added new
    { title: "DA Médio", value: avgDA.toFixed(1), icon: TrendingUp, color: "#10e6f6" }
  ];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Terminal className="w-8 h-8 text-[#00ffae]" />
            <h1 className="text-3xl md:text-4xl font-bold glow-text text-[#00ffae]">
              > COMMAND_CENTER_
            </h1>
          </div>
          <p className="text-sm text-[#10e6f6]">
            Sistema de controle e monitoramento de campanhas SEO
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="p-6 bg-[#0f0f0f] rounded-lg border border-[#1f1f1f] hover:border-[#00ffae] transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-[#10e6f6] mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold" style={{ color: stat.color }}>
                    {stat.value}
                  </p>
                </div>
                <div className="p-3 bg-[#050505] rounded-lg">
                  <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
              </div>
              <div className="h-1 bg-[#050505] rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-1000" 
                  style={{ width: '70%', background: stat.color }} 
                />
              </div>
            </div>
          ))}
        </div>

        {/* Active Campaigns Section */}
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#00ffae] flex items-center gap-2">
                    <Rocket className="w-5 h-5" />
                    Campanhas Recentes
                </h2>
                <Link to={createPageUrl('Campaigns')}>
                    <Button variant="ghost" className="text-[#10e6f6] hover:text-[#00ffae] hover:bg-[#1f1f1f]">
                        Ver Todas <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </Link>
            </div>
            
            {campaigns.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {campaigns.slice(0, 3).map((campaign) => (
                        <CampaignCard key={campaign.id} campaign={campaign} />
                    ))}
                </div>
            ) : (
                <div className="p-8 bg-[#0f0f0f] border border-[#1f1f1f] border-dashed rounded-lg text-center">
                    <p className="text-[#10e6f6] mb-4">Nenhuma campanha encontrada.</p>
                    <Link to={createPageUrl('NewCampaign')}>
                        <Button className="bg-[#00ffae] text-[#050505] hover:bg-[#00cc8e]">
                            <Rocket className="w-4 h-4 mr-2" />
                            Criar Primeira Campanha
                        </Button>
                    </Link>
                </div>
            )}
        </div>


      </div>
    </div>
  );
}
