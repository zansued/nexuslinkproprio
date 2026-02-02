import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Rocket, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import StepOne from "../components/campaign/StepOne";
import StepTwo from "../components/campaign/StepTwo";
import StepThree from "../components/campaign/StepThree";
import CampaignSummary from "../components/campaign/CampaignSummary";

export default function NewCampaign() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('edit');

  const [campaignData, setCampaignData] = useState({
    name: "",
    target_url: "",
    keywords: [],
    template_type: "mixed",
    backlinks_target: 100,
    auto_spinning: true,
    anchor_variation: true,
    status: "draft"
  });
  const [templates, setTemplates] = useState([]);

  // Fetch existing campaign if in edit mode
  useQuery({
    queryKey: ['campaign', editId],
    queryFn: () => base44.entities.Campaign.get(editId),
    enabled: !!editId,
    onSuccess: (data) => {
      if (data) {
        setCampaignData(prev => ({
          ...prev,
          ...data,
          // Ensure arrays are arrays
          keywords: data.keywords || [],
        }));
      }
    }
  });

  const saveCampaignMutation = useMutation({
    mutationFn: (data) => {
      if (editId) {
        // Remove system fields that shouldn't be updated manually if mistakenly included
        const { id, created_date, updated_date, created_by, ...updateData } = data;
        return base44.entities.Campaign.update(editId, updateData);
      }
      return base44.entities.Campaign.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaign', editId] });
      navigate(createPageUrl("Dashboard"));
    },
  });

  const isStepValid = () => {
    if (currentStep === 1) {
      const urlPattern = /^https?:\/\/.+\..+/;
      return campaignData.name.length >= 3 && 
             campaignData.name.length <= 50 && 
             urlPattern.test(campaignData.target_url);
    }
    if (currentStep === 2) {
      return campaignData.keywords.length >= 1;
    }
    if (currentStep === 3) {
      return campaignData.backlinks_target >= 10 && 
             campaignData.backlinks_target <= 10000;
    }
    return true;
  };

  const handleLaunch = async () => {
    // Salvar/Atualizar campanha
    const campaignPayload = { ...campaignData };
    
    // Se for nova campanha, inicializa contadores
    if (!editId) {
        campaignPayload.status = "draft";
        campaignPayload.backlinks_created = 0;
        campaignPayload.domain_authority = 0;
        campaignPayload.domain_rating = 0;
    }

    saveCampaignMutation.mutate(campaignPayload, {
      onSuccess: async (savedCampaign) => {
        try {
          // savedCampaign might be null on update depending on implementation, so use editId
          const targetId = editId || savedCampaign?.id;
          
          if (!editId && targetId) { 
             const { startBacklinkCampaign } = await import("@/functions/startBacklinkCampaign");
             await startBacklinkCampaign({ campaign_id: targetId });
          }
        } catch (error) {
          console.error("Erro ao iniciar automação:", error);
        }
      }
    });
  };

  const steps = [
    { number: 1, title: "URL & Nome", valid: campaignData.name.length >= 3 && /^https?:\/\/.+\..+/.test(campaignData.target_url) },
    { number: 2, title: "Keywords", valid: campaignData.keywords.length >= 1 },
    { number: 3, title: "Configuração", valid: true },
    { number: 4, title: "Resumo", valid: true }
  ];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button 
          onClick={() => navigate(createPageUrl("Dashboard"))}
          className="flex items-center gap-2 mb-6 text-[#10e6f6] hover:text-[#00ffae] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>

        <div className="flex items-center gap-3 mb-8">
          <Rocket className="w-8 h-8 text-[#00ffae]" />
          <h1 className="text-3xl font-bold glow-text text-[#00ffae]">
            > {editId ? 'EDITAR_CAMPANHA_' : 'NOVA_CAMPANHA_'}
          </h1>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between max-w-3xl mx-auto mb-8">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold border-2 transition-all ${
                    currentStep >= step.number
                      ? 'bg-[#00ffae] border-[#00ffae] text-[#050505]'
                      : step.valid
                      ? 'bg-[rgba(0,255,174,0.1)] border-[#00ffae] text-[#00ffae]'
                      : 'bg-[#050505] border-[#1f1f1f] text-[#10e6f6]'
                  }`}
                >
                  {currentStep > step.number ? (
                    <Check className="w-5 h-5 md:w-6 md:h-6" />
                  ) : step.valid && currentStep < step.number ? (
                    <Check className="w-5 h-5 md:w-6 md:h-6" />
                  ) : step.number === currentStep && !step.valid ? (
                    <AlertCircle className="w-5 h-5 md:w-6 md:h-6" />
                  ) : (
                    step.number
                  )}
                </div>
                <span className={`mt-2 text-xs font-bold hidden md:block ${
                  currentStep >= step.number ? 'text-[#00ffae]' : step.valid ? 'text-[#00ffae]' : 'text-[#10e6f6]'
                }`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className="flex-1 h-0.5 mx-2 md:mx-4 transition-all"
                  style={{ background: currentStep > step.number ? '#00ffae' : '#1f1f1f' }}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-6 md:p-8">
          {currentStep === 1 && <StepOne campaignData={campaignData} setCampaignData={setCampaignData} />}
          {currentStep === 2 && <StepTwo campaignData={campaignData} setCampaignData={setCampaignData} />}
          {currentStep === 3 && <StepThree campaignData={campaignData} setCampaignData={setCampaignData} templates={templates} />}
          {currentStep === 4 && <CampaignSummary campaignData={campaignData} />}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <Button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            variant="outline"
            className="border-[#10e6f6] text-[#10e6f6] hover:bg-[rgba(16,230,246,0.1)]"
          >
            < VOLTAR
          </Button>

          <div className="text-center">
            {!isStepValid() && currentStep < 4 && (
              <p className="text-xs text-[#fbbf24] mb-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Complete os campos obrigatórios para continuar
              </p>
            )}
          </div>

          {currentStep < 4 ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!isStepValid()}
              className="bg-[#00ffae] text-[#050505] hover:bg-[#00cc8e] disabled:opacity-50 disabled:cursor-not-allowed pulse-glow"
            >
              PRÓXIMO >
            </Button>
          ) : (
            <Button
              onClick={handleLaunch}
              disabled={saveCampaignMutation.isPending}
              className="bg-[#00ffae] text-[#050505] hover:bg-[#00cc8e] pulse-glow"
            >
              {saveCampaignMutation.isPending ? (
                <>
                  <AlertCircle className="w-4 h-4 mr-2 animate-spin" />
                  SALVANDO...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4 mr-2" />
                  {editId ? 'ATUALIZAR CAMPANHA' : 'INICIAR CAMPANHA'}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
