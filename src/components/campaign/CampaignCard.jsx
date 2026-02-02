import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
    Play, Pause, CheckCircle2, Clock, Calendar, 
    MoreHorizontal, ExternalLink, Network, ArrowRight, RotateCcw, Trash2, MoreVertical, Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function CampaignCard({ campaign }) {
    const getStatusConfig = (status) => {
        switch (status) {
            case 'active':
                return { label: 'Running', color: 'bg-[#00ffae] text-[#050505]', icon: Play };
            case 'paused':
                return { label: 'Paused', color: 'bg-yellow-500 text-[#050505]', icon: Pause };
            case 'completed':
                return { label: 'Completed', color: 'bg-blue-500 text-white', icon: CheckCircle2 };
            case 'scheduled':
                return { label: 'Scheduled', color: 'bg-purple-500 text-white', icon: Calendar };
            default:
                return { label: 'Draft', color: 'bg-gray-500 text-white', icon: Clock };
        }
    };

    const statusConfig = getStatusConfig(campaign.status);
    const StatusIcon = statusConfig.icon;
    const progress = Math.min(100, Math.round((campaign.backlinks_created / (campaign.backlinks_target || 1)) * 100));

    const queryClient = useQueryClient();

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }) => base44.entities.Campaign.update(id, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries(['campaigns']);
            toast.success("Status atualizado com sucesso!");
        }
    });

    const restartCampaignMutation = useMutation({
        mutationFn: async () => {
            // First set to active
            await base44.entities.Campaign.update(campaign.id, { status: 'active', backlinks_created: 0 });
            // Then trigger start function
            return base44.functions.invoke('startBacklinkCampaign', { campaign_id: campaign.id });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['campaigns']);
            toast.success("Campanha reiniciada! Novos jobs estão sendo criados.");
        },
        onError: (err) => {
            toast.error("Erro ao reiniciar campanha: " + err.message);
        }
    });

    const deleteCampaignMutation = useMutation({
        mutationFn: () => base44.entities.Campaign.delete(campaign.id),
        onSuccess: () => {
            queryClient.invalidateQueries(['campaigns']);
            toast.success("Campanha removida.");
        }
    });

    const getDiagramName = (key) => {
        const names = {
            diamond_star: "Diamond Star",
            diversity_power: "Diversity Power",
            pyramid_scheme: "Pyramid Scheme",
            wheel_link: "Wheel Link",
            star_link: "Star Link"
        };
        return names[key] || key;
    };

    return (
        <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-5 hover:border-[#00ffae] transition-all group relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ffae] opacity-5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-[#00ffae] text-lg mb-1 truncate max-w-[180px] md:max-w-[220px]" title={campaign.name}>
                        {campaign.name}
                    </h3>
                    <a 
                        href={campaign.target_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-[#10e6f6] hover:underline flex items-center gap-1"
                    >
                        {campaign.target_url}
                        <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
                
                <div className="flex items-center gap-2">
                    <Badge className={`${statusConfig.color} border-none flex items-center gap-1`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                    </Badge>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-[#10e6f6] hover:text-[#00ffae] hover:bg-[#00ffae]/10">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#0f0f0f] border-[#1f1f1f]">
                            {campaign.status !== 'active' && (
                                <DropdownMenuItem 
                                    className="text-[#00ffae] focus:bg-[#00ffae]/10 focus:text-[#00ffae] cursor-pointer"
                                    onClick={() => updateStatusMutation.mutate({ id: campaign.id, status: 'active' })}
                                >
                                    <Play className="w-4 h-4 mr-2" />
                                    Continuar/Ativar
                                </DropdownMenuItem>
                            )}
                            {campaign.status === 'active' && (
                                <DropdownMenuItem 
                                    className="text-yellow-500 focus:bg-yellow-500/10 focus:text-yellow-500 cursor-pointer"
                                    onClick={() => updateStatusMutation.mutate({ id: campaign.id, status: 'paused' })}
                                >
                                    <Pause className="w-4 h-4 mr-2" />
                                    Pausar
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                                className="text-[#10e6f6] focus:bg-[#10e6f6]/10 focus:text-[#10e6f6] cursor-pointer"
                                onClick={() => restartCampaignMutation.mutate()}
                                disabled={restartCampaignMutation.isPending}
                            >
                                {restartCampaignMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RotateCcw className="w-4 h-4 mr-2" />}
                                Reiniciar Automação
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                className="text-red-500 focus:bg-red-500/10 focus:text-red-500 cursor-pointer"
                                onClick={() => {
                                    if(confirm('Tem certeza que deseja excluir esta campanha?')) {
                                        deleteCampaignMutation.mutate();
                                    }
                                }}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="space-y-4">
                {/* Progress Section */}
                <div>
                    <div className="flex justify-between text-xs mb-2">
                        <span className="text-[#10e6f6]">Progresso</span>
                        <span className="text-[#00ffae] font-mono">
                            {campaign.backlinks_created} / {campaign.backlinks_target} ({progress}%)
                        </span>
                    </div>
                    <Progress value={progress} className="h-2 bg-[#1f1f1f]" indicatorClassName="bg-[#00ffae]" />
                </div>

                {/* SEO Diagram & Date */}
                <div className="flex items-center justify-between pt-4 border-t border-[#1f1f1f]">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-[#050505] border border-[#1f1f1f] flex items-center justify-center text-[#00ffae]">
                            <Network className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] text-[#10e6f6] uppercase">Estratégia</p>
                            <p className="text-xs text-gray-300">{getDiagramName(campaign.seo_diagram)}</p>
                        </div>
                    </div>
                    
                    <div className="text-right">
                        <p className="text-[10px] text-[#10e6f6] uppercase">Criado em</p>
                        <p className="text-xs text-gray-300">
                            {campaign.created_date ? format(new Date(campaign.created_date), 'dd/MM/yyyy') : '--'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Actions Overlay (visible on hover) */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                 <Link to={`${createPageUrl('NewCampaign')}?edit=${campaign.id}`}>
                    <Button variant="outline" className="border-[#00ffae] text-[#00ffae] hover:bg-[#00ffae] hover:text-[#050505]">
                        Editar
                    </Button>
                </Link>
                <Link to={`${createPageUrl('BacklinkAnalysis')}?campaign=${campaign.id}`}>
                    <Button className="bg-[#00ffae] text-[#050505] hover:bg-[#00cc8e]">
                        Ver Detalhes <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}
