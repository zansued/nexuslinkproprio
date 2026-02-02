import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2, Play, Pause } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function CampaignActions({ campaign }) {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateMetrics = async () => {
    setIsUpdating(true);
    try {
      const { updateCampaignMetrics } = await import("@/functions/updateCampaignMetrics");
      await updateCampaignMetrics({ campaign_id: campaign.id });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['backlinks'] });
    } catch (error) {
      console.error("Erro ao atualizar métricas:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleUpdateMetrics}
        disabled={isUpdating}
        size="sm"
        className="bg-[#10e6f6] text-[#050505] hover:bg-[#0dc5d4]"
      >
        {isUpdating ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <RefreshCw className="w-3 h-3" />
        )}
      </Button>
    </div>
  );
}
