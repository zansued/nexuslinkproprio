import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
    Bot, Play, Square, Activity, Globe, Send, RefreshCw, 
    FileText, Server, Clock, CheckCircle2, XCircle, AlertTriangle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

export default function AutomationCenter() {
    const [isAutoPilotOn, setIsAutoPilotOn] = useState(false);
    const [lastRun, setLastRun] = useState(null);
    const queryClient = useQueryClient();

    // Fetch Logs
    const { data: logs = [] } = useQuery({
        queryKey: ['automation_logs'],
        queryFn: () => base44.entities.AutomationLog.list("-created_date", 50),
        refetchInterval: 5000, // Live updates
        initialData: [],
    });

    // Run Cycle Mutation
    const runCycleMutation = useMutation({
        mutationFn: async () => {
             const res = await base44.functions.invoke('runAutomationCycle');
             return res.data;
        },
        onSuccess: (data) => {
            setLastRun(new Date());
            queryClient.invalidateQueries(['automation_logs']);
            if (data.processed_indexing > 0 || data.processed_outreach > 0 || data.processed_jobs > 0) {
                toast.success(`Ciclo concluído: ${data.processed_jobs || 0} jobs, ${data.processed_indexing} indexados, ${data.processed_outreach} discoveries.`);
            }
        },
        onError: () => {
            setIsAutoPilotOn(false); // Stop on error
            toast.error("Erro no ciclo de automação.");
        }
    });

    // Auto-Pilot Effect
    useEffect(() => {
        let interval;
        if (isAutoPilotOn) {
            // Run immediately then every 30s
            runCycleMutation.mutate();
            interval = setInterval(() => {
                if (!runCycleMutation.isPending) {
                    runCycleMutation.mutate();
                }
            }, 30000);
        }
        return () => clearInterval(interval);
    }, [isAutoPilotOn]);

    const getStatusIcon = (status) => {
        switch(status) {
            case 'success': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
            case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
            default: return <Activity className="w-4 h-4 text-gray-500" />;
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Bot className="w-10 h-10 text-[#00ffae]" />
                        <div>
                            <h1 className="text-3xl font-bold glow-text text-[#00ffae]">
                                > CENTRO_DE_AUTOMAÇÃO_
                            </h1>
                            <p className="text-[#10e6f6] text-sm">
                                Gerenciamento de Agentes e Tarefas Contínuas
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right mr-4 hidden md:block">
                            <p className="text-xs text-[#10e6f6] uppercase">Status do Sistema</p>
                            <p className={`font-bold ${isAutoPilotOn ? "text-[#00ffae] pulse-glow" : "text-gray-500"}`}>
                                {isAutoPilotOn ? "ONLINE // EXECUTANDO" : "OFFLINE // AGUARDANDO"}
                            </p>
                        </div>
                        <Button
                            onClick={() => setIsAutoPilotOn(!isAutoPilotOn)}
                            className={`h-12 px-6 font-bold border ${
                                isAutoPilotOn 
                                ? "bg-red-900/20 border-red-500 text-red-500 hover:bg-red-900/40" 
                                : "bg-[#00ffae]/10 border-[#00ffae] text-[#00ffae] hover:bg-[#00ffae]/20"
                            }`}
                        >
                            {isAutoPilotOn ? (
                                <><Square className="w-5 h-5 mr-2 fill-current" /> PARAR AUTOMAÇÃO</>
                            ) : (
                                <><Play className="w-5 h-5 mr-2 fill-current" /> INICIAR AUTO-PILOT</>
                            )}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Status Card 1 */}
                    <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-6 relative overflow-hidden group hover:border-[#00ffae] transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Globe className="w-16 h-16 text-[#00ffae]" />
                        </div>
                        <h3 className="text-[#10e6f6] font-bold mb-1">Indexação Automática</h3>
                        <p className="text-xs text-gray-500 mb-4">Ping para motores de busca</p>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-bold text-[#00ffae]">
                                {logs.filter(l => l.action_type === 'indexing' && l.status === 'success').length}
                            </span>
                            <span className="text-xs text-[#10e6f6] mb-1">URLs enviadas</span>
                        </div>
                    </div>

                    {/* Status Card 2 */}
                    <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-6 relative overflow-hidden group hover:border-[#00ffae] transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Send className="w-16 h-16 text-[#00ffae]" />
                        </div>
                        <h3 className="text-[#10e6f6] font-bold mb-1">Fila de Outreach</h3>
                        <p className="text-xs text-gray-500 mb-4">Processamento em Massa</p>
                        <div className="flex items-end gap-2">
                             {/* Note: In a real app we'd fetch the job counts separately */}
                            <span className="text-3xl font-bold text-[#00ffae]">
                                {logs.filter(l => l.details && l.details.includes('Processed')).reduce((acc, l) => {
                                    const match = l.details.match(/Processed (\d+) mass/);
                                    return acc + (match ? parseInt(match[1]) : 0);
                                }, 0)}
                            </span>
                            <span className="text-xs text-[#10e6f6] mb-1">jobs processados</span>
                        </div>
                    </div>

                    {/* Status Card 3 */}
                    <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-6 relative overflow-hidden group hover:border-[#00ffae] transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Server className="w-16 h-16 text-[#00ffae]" />
                        </div>
                        <h3 className="text-[#10e6f6] font-bold mb-1">Contas Criadas</h3>
                        <p className="text-xs text-gray-500 mb-4">Registro Auto + Captcha</p>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-bold text-[#00ffae]">
                                {logs.filter(l => l.action_type === 'registration' && l.status === 'success').length}
                            </span>
                            <span className="text-xs text-[#10e6f6] mb-1">novas contas</span>
                        </div>
                    </div>
                </div>

                {/* Logs Console */}
                <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg overflow-hidden">
                    <div className="p-4 border-b border-[#1f1f1f] flex justify-between items-center bg-[#0a0a0a]">
                        <h2 className="font-bold text-[#00ffae] flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            CONSOLE DE LOGS_
                        </h2>
                        {lastRun && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                <RefreshCw className={`w-3 h-3 ${runCycleMutation.isPending ? "animate-spin" : ""}`} />
                                Última execução: {lastRun.toLocaleTimeString()}
                            </span>
                        )}
                    </div>
                    <ScrollArea className="h-[400px]">
                        <div className="p-0">
                            {logs.map((log) => (
                                <div 
                                    key={log.id} 
                                    className="border-b border-[#1f1f1f] px-4 py-3 hover:bg-[#00ffae]/5 transition-colors flex items-center gap-4 text-sm font-mono"
                                >
                                    <div className="w-4 flex-shrink-0">
                                        {getStatusIcon(log.status)}
                                    </div>
                                    <div className="w-32 flex-shrink-0 text-gray-500 text-xs">
                                        {new Date(log.created_date).toLocaleString()}
                                    </div>
                                    <div className="w-32 flex-shrink-0">
                                        <Badge variant="outline" className="border-[#1f1f1f] text-[#10e6f6] bg-[#050505]">
                                            {log.action_type}
                                        </Badge>
                                    </div>
                                    <div className="flex-1 text-gray-300">
                                        <span className="text-[#00ffae] mr-2">[{log.agent_name}]</span>
                                        {log.details}
                                    </div>
                                </div>
                            ))}
                            {logs.length === 0 && (
                                <div className="p-8 text-center text-gray-500">
                                    Nenhuma atividade registrada. Inicie a automação.
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
}
