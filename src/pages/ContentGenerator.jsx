import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Sparkles, Loader2, FileText, MessageSquare, RefreshCw, 
  Copy, Check, Download, Hash, Globe
} from "lucide-react";

export default function ContentGenerator() {
  const [contentType, setContentType] = useState("blog_post");
  const [keywords, setKeywords] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [tone, setTone] = useState("profissional");
  const [length, setLength] = useState("médio");
  const [platform, setPlatform] = useState("múltiplas");
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [generatedContent, setGeneratedContent] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => base44.entities.Campaign.list(),
    initialData: [],
  });

  const loadFromCampaign = (campaignId) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (campaign) {
      setKeywords(campaign.keywords.join(', '));
      setTargetUrl(campaign.target_url);
    }
  };

  const handleGenerate = async () => {
    if (!keywords.trim()) return;

    setIsGenerating(true);
    try {
      const { generateContent } = await import("@/functions/generateContent");
      const result = await generateContent({
        content_type: contentType,
        keywords: keywords.split(',').map(k => k.trim()).filter(k => k),
        target_url: targetUrl,
        tone,
        length,
        platform
      });
      setGeneratedContent(result.data.content);
    } catch (error) {
      console.error("Erro ao gerar conteúdo:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const downloadContent = (content, filename) => {
    const blob = new Blob([content], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="w-8 h-8 text-[#00ffae]" />
          <h1 className="text-3xl font-bold glow-text text-[#00ffae]">
            > GERADOR_DE_CONTEÚDO_IA_
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-6">
              <h2 className="text-lg font-bold text-[#00ffae] mb-4">CONFIGURAÇÃO</h2>

              <div className="space-y-4">
                {/* Load from Campaign */}
                <div>
                  <Label className="text-[#10e6f6] mb-2">Carregar de Campanha</Label>
                  <Select value={selectedCampaign} onValueChange={(val) => { setSelectedCampaign(val); loadFromCampaign(val); }}>
                    <SelectTrigger className="bg-[#050505] border-[#1f1f1f] text-[#00ffae]">
                      <SelectValue placeholder="Selecione..." />
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

                {/* Content Type */}
                <div>
                  <Label className="text-[#10e6f6] mb-2">Tipo de Conteúdo</Label>
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger className="bg-[#050505] border-[#1f1f1f] text-[#00ffae]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0f0f0f] border-[#1f1f1f]">
                      <SelectItem value="blog_post">📝 Artigo de Blog</SelectItem>
                      <SelectItem value="social_media">📱 Posts Social Media</SelectItem>
                      <SelectItem value="spin_variations">🔄 Variações de Conteúdo</SelectItem>
                      <SelectItem value="meta_descriptions">🏷️ Meta Descriptions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Keywords */}
                <div>
                  <Label className="text-[#10e6f6] mb-2">Keywords (separadas por vírgula)</Label>
                  <Textarea
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="SEO, backlinks, marketing digital"
                    className="bg-[#050505] border-[#1f1f1f] text-[#00ffae] min-h-[80px]"
                  />
                </div>

                {/* Target URL */}
                <div>
                  <Label className="text-[#10e6f6] mb-2">URL Alvo (opcional)</Label>
                  <Input
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://seu-site.com"
                    className="bg-[#050505] border-[#1f1f1f] text-[#00ffae]"
                  />
                </div>

                {/* Tone */}
                {(contentType === 'blog_post' || contentType === 'social_media') && (
                  <div>
                    <Label className="text-[#10e6f6] mb-2">Tom</Label>
                    <Select value={tone} onValueChange={setTone}>
                      <SelectTrigger className="bg-[#050505] border-[#1f1f1f] text-[#00ffae]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0f0f0f] border-[#1f1f1f]">
                        <SelectItem value="profissional">Profissional</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="técnico">Técnico</SelectItem>
                        <SelectItem value="engajador">Engajador</SelectItem>
                        <SelectItem value="educativo">Educativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Length */}
                {contentType === 'blog_post' && (
                  <div>
                    <Label className="text-[#10e6f6] mb-2">Tamanho</Label>
                    <Select value={length} onValueChange={setLength}>
                      <SelectTrigger className="bg-[#050505] border-[#1f1f1f] text-[#00ffae]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0f0f0f] border-[#1f1f1f]">
                        <SelectItem value="curto">Curto (~500 palavras)</SelectItem>
                        <SelectItem value="médio">Médio (~1000 palavras)</SelectItem>
                        <SelectItem value="longo">Longo (~2000 palavras)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Platform */}
                {contentType === 'social_media' && (
                  <div>
                    <Label className="text-[#10e6f6] mb-2">Plataforma</Label>
                    <Select value={platform} onValueChange={setPlatform}>
                      <SelectTrigger className="bg-[#050505] border-[#1f1f1f] text-[#00ffae]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0f0f0f] border-[#1f1f1f]">
                        <SelectItem value="múltiplas">Múltiplas Plataformas</SelectItem>
                        <SelectItem value="twitter">Twitter/X</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !keywords.trim()}
                  className="w-full bg-[#00ffae] text-[#050505] hover:bg-[#00cc8e] pulse-glow"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      GERANDO...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      GERAR CONTEÚDO
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Content Display */}
          <div className="lg:col-span-2">
            <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-6 min-h-[600px]">
              {!generatedContent ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                  <Sparkles className="w-16 h-16 text-[#00ffae] mb-4 opacity-50" />
                  <h3 className="text-xl font-bold text-[#00ffae] mb-2">
                    Pronto para Criar Conteúdo
                  </h3>
                  <p className="text-[#10e6f6] max-w-md">
                    Configure os parâmetros à esquerda e clique em "GERAR CONTEÚDO" 
                    para criar conteúdo otimizado com IA
                  </p>
                </div>
              ) : contentType === 'blog_post' ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-[#00ffae]">Artigo Gerado</h2>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => copyToClipboard(generatedContent.content, 0)}
                        className="bg-[#10e6f6] text-[#050505]"
                        size="sm"
                      >
                        {copiedIndex === 0 ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                      <Button
                        onClick={() => downloadContent(generatedContent.content, 'article.html')}
                        className="bg-[#00ffae] text-[#050505]"
                        size="sm"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-3 bg-[#050505] rounded">
                      <p className="text-xs text-[#10e6f6] mb-1">Título:</p>
                      <p className="font-bold text-[#00ffae]">{generatedContent.title}</p>
                    </div>

                    <div className="p-3 bg-[#050505] rounded">
                      <p className="text-xs text-[#10e6f6] mb-1">Meta Description:</p>
                      <p className="text-sm text-[#00ffae]">{generatedContent.meta_description}</p>
                    </div>

                    <div className="flex gap-3 text-sm">
                      <div className="p-2 bg-[#050505] rounded">
                        <span className="text-[#10e6f6]">Palavras: </span>
                        <span className="text-[#00ffae] font-bold">{generatedContent.word_count}</span>
                      </div>
                      <div className="p-2 bg-[#050505] rounded">
                        <span className="text-[#10e6f6]">Keywords: </span>
                        <span className="text-[#00ffae] font-bold">{generatedContent.keywords_used?.length || 0}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-[#050505] rounded border border-[#1f1f1f] max-h-[500px] overflow-y-auto">
                      <div 
                        className="prose prose-invert max-w-none text-[#10e6f6]"
                        dangerouslySetInnerHTML={{ __html: generatedContent.content }}
                      />
                    </div>
                  </div>
                </div>
              ) : contentType === 'social_media' ? (
                <div>
                  <h2 className="text-xl font-bold text-[#00ffae] mb-4">Posts Gerados</h2>
                  <div className="space-y-3">
                    {generatedContent.posts?.map((post, idx) => (
                      <div key={idx} className="p-4 bg-[#050505] rounded border border-[#1f1f1f]">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-[#00ffae]" />
                            <span className="font-bold text-[#00ffae]">{post.platform}</span>
                          </div>
                          <Button
                            onClick={() => copyToClipboard(post.text, idx)}
                            className="bg-[#10e6f6] text-[#050505]"
                            size="sm"
                          >
                            {copiedIndex === idx ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                        <p className="text-[#10e6f6] mb-2 whitespace-pre-wrap">{post.text}</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {post.hashtags?.map((tag, i) => (
                            <span key={i} className="text-xs text-[#00ffae]">#{tag}</span>
                          ))}
                        </div>
                        <p className="text-xs text-[#10e6f6]">{post.char_count} caracteres</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : contentType === 'spin_variations' ? (
                <div>
                  <h2 className="text-xl font-bold text-[#00ffae] mb-4">Variações de Conteúdo</h2>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {generatedContent.variations?.map((variation, idx) => (
                      <div key={idx} className="p-4 bg-[#050505] rounded border border-[#1f1f1f]">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <span className="font-bold text-[#00ffae]">Variação #{idx + 1}</span>
                            <span className="text-xs text-[#10e6f6] ml-2">({variation.platform_type})</span>
                          </div>
                          <Button
                            onClick={() => copyToClipboard(variation.content, idx)}
                            className="bg-[#10e6f6] text-[#050505]"
                            size="sm"
                          >
                            {copiedIndex === idx ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                        <p className="text-sm text-[#10e6f6] mb-2 whitespace-pre-wrap">{variation.content}</p>
                        <div className="flex gap-3 text-xs">
                          <span className="text-[#10e6f6]">
                            Unicidade: <span className="text-[#00ffae] font-bold">{variation.uniqueness_score}%</span>
                          </span>
                          <span className="text-[#10e6f6]">
                            Palavras: <span className="text-[#00ffae] font-bold">{variation.word_count}</span>
                          </span>
                          <span className="text-[#10e6f6]">
                            Densidade: <span className="text-[#00ffae] font-bold">{variation.keyword_density}</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-bold text-[#00ffae] mb-4">Meta Descriptions</h2>
                  <div className="space-y-2">
                    {generatedContent.meta_descriptions?.map((meta, idx) => (
                      <div key={idx} className="p-3 bg-[#050505] rounded border border-[#1f1f1f] flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm text-[#10e6f6] mb-1">{meta.text}</p>
                          <p className="text-xs text-[#00ffae]">{meta.char_count} caracteres</p>
                        </div>
                        <Button
                          onClick={() => copyToClipboard(meta.text, idx)}
                          className="bg-[#10e6f6] text-[#050505]"
                          size="sm"
                        >
                          {copiedIndex === idx ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
