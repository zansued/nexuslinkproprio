import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Globe, Plus, CheckCircle2, XCircle, RefreshCw, Trash2, ShieldCheck, Activity, Bot, Loader2, Brain } from "lucide-react";

export default function ProxyManager() {
  const [isAdding, setIsAdding] = useState(false);
  const [proxyList, setProxyList] = useState("");
  const queryClient = useQueryClient();

  // Fetch proxies
  const { data: proxies = [], isLoading } = useQuery({
    queryKey: ['proxies'],
    queryFn: () => base44.entities.Proxy.list("-last_checked"),
    initialData: [],
  });

  // Bulk create proxies
  const createMutation = useMutation({
    mutationFn: async (list) => {
      const lines = list.split('\n').filter(l => l.trim());
      const newProxies = lines.map(line => {
        // Format: ip:port:user:pass or ip:port
        const parts = line.split(':');
        return {
          ip: parts[0],
          port: parseInt(parts[1]),
          username: parts[2] || null,
          password: parts[3] || null,
          protocol: 'http',
          status: 'testing'
        };
      });
      return base44.entities.Proxy.bulkCreate(newProxies);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['proxies']);
      setIsAdding(false);
      setProxyList("");
    }
  });

  // Check proxies function
  const checkMutation = useMutation({
    mutationFn: () => base44.functions.invoke('checkProxies'),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['proxies']);
    }
  });

  const huntProxiesMutation = useMutation({
    mutationFn: () => base44.functions.invoke('findProxies'),
    onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['proxies'] });
        alert(data.message || "Proxy hunt completed");
    }
  });

  const validateProxiesMutation = useMutation({
    mutationFn: () => base44.functions.invoke('validateProxiesWithAI'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proxies'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Proxy.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['proxies'])
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'good': return 'bg-[#00ffae] text-[#050505]';
      case 'active': return 'bg-blue-500 text-white';
      case 'risky': return 'bg-[#fbbf24] text-[#050505]';
      case 'dead': return 'bg-[#ef4444] text-white';
      case 'slow': return 'bg-orange-500 text-white';
      default: return 'bg-[#1f1f1f] text-[#10e6f6]';
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Globe className="w-8 h-8 text-[#00ffae]" />
            <div>
              <h1 className="text-3xl font-bold glow-text text-[#00ffae]">
                > PROXY_MANAGER_
              </h1>
              <p className="text-sm text-[#10e6f6]">
                Infraestrutura de anonimato para operações em escala
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
                onClick={() => huntProxiesMutation.mutate()}
                disabled={huntProxiesMutation.isPending}
                className="bg-[#a855f7] text-white hover:bg-[#9333ea] border border-[#a855f7] pulse-glow"
            >
                {huntProxiesMutation.isPending ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        HUNTING...
                    </>
                ) : (
                    <>
                        <Bot className="w-4 h-4 mr-2" />
                        AUTO HUNT (AI)
                    </>
                )}
            </Button>
            <Button
              onClick={() => validateProxiesMutation.mutate()}
              disabled={validateProxiesMutation.isPending}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700"
            >
              {validateProxiesMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  VALIDATING...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  RUN AI VALIDATION
                </>
              )}
            </Button>
            <Button
              onClick={() => checkMutation.mutate()}
              disabled={checkMutation.isPending}
              className="bg-[#1f1f1f] border border-[#00ffae] text-[#00ffae] hover:bg-[#00ffae]/10"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${checkMutation.isPending ? 'animate-spin' : ''}`} />
              Verificar Saúde
            </Button>
            <Button
              onClick={() => setIsAdding(!isAdding)}
              className="bg-[#00ffae] text-[#050505] hover:bg-[#00cc8e]"
            >
              <Plus className="w-4 h-4 mr-2" /> Importar Proxies
            </Button>
          </div>
        </div>

        {isAdding && (
          <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-6 mb-8 animate-in fade-in slide-in-from-top-4">
            <h2 className="text-lg font-bold text-[#00ffae] mb-4">Importação em Massa</h2>
            <p className="text-xs text-[#10e6f6] mb-2">Formato: IP:PORT ou IP:PORT:USER:PASS (um por linha)</p>
            <Textarea
              value={proxyList}
              onChange={(e) => setProxyList(e.target.value)}
              placeholder="192.168.1.1:8080&#10;10.0.0.1:3128:admin:secret"
              className="bg-[#050505] border-[#1f1f1f] text-[#00ffae] h-40 mb-4 font-mono"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAdding(false)} className="border-[#1f1f1f] text-[#10e6f6]">
                Cancelar
              </Button>
              <Button 
                onClick={() => createMutation.mutate(proxyList)}
                disabled={!proxyList.trim() || createMutation.isPending}
                className="bg-[#00ffae] text-[#050505] hover:bg-[#00cc8e]"
              >
                {createMutation.isPending ? 'Processando...' : 'Importar Proxies'}
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {proxies.map((proxy) => (
            <div 
              key={proxy.id} 
              className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-4 hover:border-[#00ffae] transition-all group relative"
            >
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                   variant="ghost" 
                   size="icon" 
                   onClick={() => deleteMutation.mutate(proxy.id)}
                   className="h-6 w-6 text-red-500 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <ShieldCheck className="w-5 h-5 text-[#10e6f6]" />
                <span className="font-mono text-[#00ffae] font-bold">{proxy.ip}:{proxy.port}</span>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                 <Badge className={getStatusColor(proxy.status)}>
                   {proxy.status.toUpperCase()}
                 </Badge>
                 <span className="text-xs text-[#10e6f6] font-mono">{proxy.protocol}</span>
              </div>

              {proxy.quality_score && (
                <div className="mb-2">
                  <Badge variant="outline" className={
                    proxy.quality_score >= 80 ? 'border-[#00ffae] text-[#00ffae]' :
                    proxy.quality_score >= 60 ? 'border-blue-500 text-blue-500' :
                    proxy.quality_score >= 40 ? 'border-yellow-500 text-yellow-500' :
                    'border-red-500 text-red-500'
                  }>
                    Quality: {proxy.quality_score}/100
                  </Badge>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs text-[#10e6f6] mt-3 pt-3 border-t border-[#1f1f1f]">
                <div>
                   <p className="opacity-50">Latency</p>
                   <p className="font-mono text-[#00ffae]">{proxy.response_time ? `${proxy.response_time}ms` : 'N/A'}</p>
                </div>
                <div>
                   <p className="opacity-50">Location</p>
                   <p className="text-[#00ffae]">{proxy.country || 'Unknown'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {proxies.length === 0 && !isLoading && (
          <div className="text-center py-20 bg-[#0f0f0f] rounded-lg border border-dashed border-[#1f1f1f]">
             <Globe className="w-12 h-12 text-[#1f1f1f] mx-auto mb-4" />
             <p className="text-[#10e6f6]">Nenhum proxy configurado.</p>
             <p className="text-xs text-gray-500">Adicione proxies para habilitar operações em escala anônima.</p>
          </div>
        )}
      </div>
    </div>
  );
}
