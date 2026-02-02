import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Terminal, Activity, Rocket, Zap, Sparkles, Users, Settings, Bot, LogOut, LayoutList, Globe, TrendingUp, Network } from "lucide-react";

export default function Layout({ children }) {
  const location = useLocation();

  const navItems = [
    { title: "Command Center", url: createPageUrl("Dashboard"), icon: Terminal },
    { title: "Campanhas", url: createPageUrl("Campaigns"), icon: LayoutList },
    { title: "Nova Campanha", url: createPageUrl("NewCampaign"), icon: Rocket },
    { title: "Laboratório", url: createPageUrl("Laboratory"), icon: Zap },
    { title: "Descobrir Fontes", url: createPageUrl("DiscoverySources"), icon: Activity },
    { title: "Análise de Backlinks", url: createPageUrl("BacklinkAnalysis"), icon: Activity },
    { title: "Gerador de Conteúdo", url: createPageUrl("ContentGenerator"), icon: Sparkles },
    { title: "Agentes IA", url: createPageUrl("AgentCommand"), icon: Users },
    { title: "Centro de Automação", url: createPageUrl("AutomationCenter"), icon: Bot },
    { title: "Gerenciador de Proxies", url: createPageUrl("ProxyManager"), icon: Globe },
    { title: "Rastreador de Rankings", url: createPageUrl("RankTracker"), icon: TrendingUp },
    { title: "Diagramas SEO", url: createPageUrl("SEODiagrams"), icon: Network },
    { title: "Minhas Contas", url: createPageUrl("Accounts"), icon: Users },
    { title: "Configurações", url: createPageUrl("Settings"), icon: Settings },
    ];

  return (
    <div className="min-h-screen bg-[#050505] text-[#00ffae]" style={{ fontFamily: "'Courier New', monospace" }}>
      <style>{`
        .glow-text {
          text-shadow: 0 0 10px #00ffae, 0 0 20px #00ffae;
        }
        .glow-border {
          box-shadow: 0 0 10px rgba(0, 255, 174, 0.3);
        }
        .pulse-glow {
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 5px #00ffae; }
          50% { box-shadow: 0 0 20px #00ffae, 0 0 30px #00ffae; }
        }
        .scan-line {
          animation: scan 8s linear infinite;
        }
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
      `}</style>

      {/* Scan line effect */}
      <div className="scan-line fixed w-full h-px bg-gradient-to-r from-transparent via-[#00ffae] to-transparent opacity-20 pointer-events-none z-50" />

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-[#0f0f0f] border-r border-[#1f1f1f] hidden md:block">
        <div className="p-6 border-b border-[#1f1f1f]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#050505] border-2 border-[#00ffae] rounded-lg flex items-center justify-center pulse-glow">
              <Terminal className="w-6 h-6 text-[#00ffae]" />
            </div>
            <div>
              <h2 className="font-bold text-[#00ffae] glow-text">SEO_HACKER</h2>
              <p className="text-xs text-[#10e6f6]">v2.0.1_PHANTOM</p>
            </div>
          </div>
        </div>

        <nav className="p-4">
          <p className="text-xs text-[#10e6f6] uppercase mb-3 px-2">> NAVIGATION_</p>
          {navItems.map((item) => (
            <Link
              key={item.url}
              to={item.url}
              className={`flex items-center gap-3 px-3 py-2 mb-2 rounded-lg transition-all ${
                location.pathname === item.url
                  ? 'bg-[rgba(0,255,174,0.1)] border border-[#00ffae] text-[#00ffae]'
                  : 'text-[#10e6f6] hover:bg-[rgba(0,255,174,0.05)]'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="font-medium">{item.title}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-[#1f1f1f]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#050505] border border-[#00ffae] rounded-full flex items-center justify-center">
                <span className="text-xs text-[#00ffae]">U</span>
              </div>
              <div>
                <p className="text-xs text-[#00ffae]">root@localhost</p>
                <p className="text-xs text-[#10e6f6]">/SEO_OPERATIONS</p>
              </div>
            </div>
            <button 
              onClick={() => base44.auth.logout()} 
              className="p-2 hover:bg-[#1f1f1f] rounded-lg transition-colors group"
              title="Desconectar"
            >
              <LogOut className="w-4 h-4 text-[#10e6f6] group-hover:text-[#ef4444]" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:ml-64">
        {children}
      </div>
    </div>
  );
}
