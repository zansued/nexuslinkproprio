import React, { useState } from "react";
import { Users, Cpu, PenTool, Globe, ChevronRight, Search } from "lucide-react";
import AgentChatInterface from "@/components/agents/AgentChatInterface";

export default function AgentCommand() {
  const [activeAgent, setActiveAgent] = useState("master_seo");

  const agents = [
    {
      id: "master_seo",
      name: "Master SEO",
      role: "Líder de Estratégia",
      icon: Cpu,
      description: "Coordena operações, analisa métricas e define o plano de ataque.",
      color: "text-purple-400",
      border: "border-purple-500/50",
      bg: "bg-purple-900/10"
    },
    {
      id: "content_creator",
      name: "Content Creator",
      role: "Especialista em Conteúdo",
      icon: PenTool,
      description: "Gera artigos, copies e otimiza textos para conversão.",
      color: "text-blue-400",
      border: "border-blue-500/50",
      bg: "bg-blue-900/10"
    },
    {
      id: "outreach_specialist",
      name: "Outreach Specialist",
      role: "Link Builder",
      icon: Globe,
      description: "Gerencia contas e registra backlinks em fontes descobertas.",
      color: "text-green-400",
      border: "border-green-500/50",
      bg: "bg-green-900/10"
    },
    {
      id: "source_hunter",
      name: "Source Hunter",
      role: "Explorador de Fontes",
      icon: Search,
      description: "Varre a web buscando novas plataformas e oportunidades de backlink.",
      color: "text-yellow-400",
      border: "border-yellow-500/50",
      bg: "bg-yellow-900/10"
    }
  ];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Users className="w-8 h-8 text-[#00ffae]" />
          <h1 className="text-3xl font-bold glow-text text-[#00ffae]">
            > AGENT_COMMAND_CENTER_
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Agent Selection */}
          <div className="space-y-4">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setActiveAgent(agent.id)}
                className={`w-full text-left p-4 rounded-lg border transition-all group ${
                  activeAgent === agent.id
                    ? `${agent.bg} ${agent.border} shadow-[0_0_15px_rgba(0,0,0,0.3)]`
                    : "bg-[#0f0f0f] border-[#1f1f1f] hover:border-[#00ffae]/50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg bg-[#050505] ${agent.color}`}>
                    <agent.icon className="w-5 h-5" />
                  </div>
                  {activeAgent === agent.id && (
                    <div className="w-2 h-2 rounded-full bg-[#00ffae] animate-pulse" />
                  )}
                </div>
                <h3 className={`font-bold mb-1 ${activeAgent === agent.id ? 'text-[#00ffae]' : 'text-gray-300'}`}>
                  {agent.name}
                </h3>
                <p className="text-xs text-gray-500 mb-2">{agent.role}</p>
                <p className="text-xs text-gray-400 line-clamp-2">
                  {agent.description}
                </p>
              </button>
            ))}
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <AgentChatInterface selectedAgent={activeAgent} />
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-[#0f0f0f] rounded border border-[#1f1f1f]">
                <p className="text-xs text-gray-500 mb-1">Status do Sistema</p>
                <p className="text-[#00ffae] font-mono text-sm">ALL SYSTEMS OPERATIONAL</p>
              </div>
              <div className="p-3 bg-[#0f0f0f] rounded border border-[#1f1f1f]">
                <p className="text-xs text-gray-500 mb-1">Taxa de Resposta IA</p>
                <p className="text-[#00ffae] font-mono text-sm">~1.2s LATENCY</p>
              </div>
              <div className="p-3 bg-[#0f0f0f] rounded border border-[#1f1f1f]">
                <p className="text-xs text-gray-500 mb-1">Protocolo Ativo</p>
                <p className="text-[#00ffae] font-mono text-sm">AUTONOMOUS_MODE_V2</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
