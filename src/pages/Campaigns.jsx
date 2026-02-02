import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutList, Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import CampaignCard from "@/components/campaign/CampaignCard";

export default function Campaigns() {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("all");

    const { data: campaigns = [], isLoading } = useQuery({
        queryKey: ['campaigns'],
        queryFn: () => base44.entities.Campaign.list("-created_date"),
        initialData: [],
    });

    const filterCampaigns = (status) => {
        return campaigns.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  c.target_url.toLowerCase().includes(searchTerm.toLowerCase());
            
            if (status === 'all') return matchesSearch;
            
            // Map UI tabs to entity statuses
            if (status === 'running') return matchesSearch && c.status === 'active';
            if (status === 'paused') return matchesSearch && c.status === 'paused';
            if (status === 'completed') return matchesSearch && c.status === 'completed';
            if (status === 'scheduled') return matchesSearch && (c.status === 'scheduled' || c.status === 'draft'); // treating draft as scheduled/pending for now
            
            return matchesSearch;
        });
    };

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <LayoutList className="w-8 h-8 text-[#00ffae]" />
                        <div>
                            <h1 className="text-3xl font-bold glow-text text-[#00ffae]">
                                > CAMPANHAS_SEO_
                            </h1>
                            <p className="text-sm text-[#10e6f6]">
                                Gerencie suas estratégias de backlink e automação
                            </p>
                        </div>
                    </div>
                    <Link to={createPageUrl('NewCampaign')}>
                        <Button className="bg-[#00ffae] text-[#050505] hover:bg-[#00cc8e] pulse-glow">
                            <Plus className="w-4 h-4 mr-2" />
                            Nova Campanha
                        </Button>
                    </Link>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#10e6f6]" />
                        <Input
                            placeholder="Buscar campanhas..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 bg-[#050505] border-[#1f1f1f] text-[#00ffae]"
                        />
                    </div>
                </div>

                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="bg-[#0f0f0f] border border-[#1f1f1f] mb-6 w-full md:w-auto overflow-x-auto flex justify-start">
                        <TabsTrigger value="all" className="data-[state=active]:bg-[#00ffae] data-[state=active]:text-[#050505] text-[#10e6f6]">
                            Todas ({campaigns.length})
                        </TabsTrigger>
                        <TabsTrigger value="running" className="data-[state=active]:bg-[#00ffae] data-[state=active]:text-[#050505] text-[#10e6f6]">
                            Running
                        </TabsTrigger>
                        <TabsTrigger value="paused" className="data-[state=active]:bg-[#00ffae] data-[state=active]:text-[#050505] text-[#10e6f6]">
                            Paused
                        </TabsTrigger>
                        <TabsTrigger value="scheduled" className="data-[state=active]:bg-[#00ffae] data-[state=active]:text-[#050505] text-[#10e6f6]">
                            Scheduled
                        </TabsTrigger>
                        <TabsTrigger value="completed" className="data-[state=active]:bg-[#00ffae] data-[state=active]:text-[#050505] text-[#10e6f6]">
                            Completed
                        </TabsTrigger>
                    </TabsList>

                    {['all', 'running', 'paused', 'scheduled', 'completed'].map((tab) => (
                        <TabsContent key={tab} value={tab} className="mt-0">
                            {filterCampaigns(tab).length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {filterCampaigns(tab).map((campaign) => (
                                        <CampaignCard key={campaign.id} campaign={campaign} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg border-dashed">
                                    <LayoutList className="w-12 h-12 text-[#1f1f1f] mx-auto mb-4" />
                                    <h3 className="text-[#00ffae] text-lg font-bold mb-2">Nenhuma campanha encontrada</h3>
                                    <p className="text-gray-500 max-w-sm mx-auto">
                                        Não encontramos campanhas com este status ou termo de busca.
                                    </p>
                                </div>
                            )}
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </div>
    );
}
