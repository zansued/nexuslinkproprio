import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, BarChart3, Link2, Search, Shield, Zap } from 'lucide-react'

export default function Home() {
  const features = [
    {
      icon: <Link2 className="h-6 w-6" />,
      title: 'Gestão de Backlinks',
      description: 'Crie e gerencie campanhas de link building de forma eficiente'
    },
    {
      icon: <Search className="h-6 w-6" />,
      title: 'Análise de SEO',
      description: 'Analise oportunidades e monitore resultados em tempo real'
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Rastreamento de Rankings',
      description: 'Acompanhe posições de palavras-chave nos motores de busca'
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Automação Inteligente',
      description: 'Automatize tarefas repetitivas e otimize seu fluxo de trabalho'
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Gestão de Proxies',
      description: 'Gerencie proxies para automação segura e escalável'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            NexusLink
            <span className="text-primary ml-2">Pro</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Plataforma completa de automação de SEO e backlinks para profissionais de marketing digital.
            Gerencie campanhas, analise resultados e otimize sua estratégia de link building.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/dashboard">
                Começar Agora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/campaigns">
                Ver Campanhas
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Comece rapidamente com estas ações principais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto py-6" asChild>
                <Link to="/campaigns/new" className="flex flex-col items-center gap-2">
                  <Link2 className="h-8 w-8" />
                  <span className="font-semibold">Nova Campanha</span>
                  <span className="text-sm text-muted-foreground">Crie uma campanha de backlinks</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-6" asChild>
                <Link to="/backlink-analysis" className="flex flex-col items-center gap-2">
                  <Search className="h-8 w-8" />
                  <span className="font-semibold">Análise de Backlinks</span>
                  <span className="text-sm text-muted-foreground">Analise backlinks existentes</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-6" asChild>
                <Link to="/content-generator" className="flex flex-col items-center gap-2">
                  <Zap className="h-8 w-8" />
                  <span className="font-semibold">Gerar Conteúdo</span>
                  <span className="text-sm text-muted-foreground">Crie conteúdo otimizado</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Preview */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Pronto para otimizar sua estratégia de SEO?</h2>
          <p className="text-muted-foreground mb-8">
            Junte-se a milhares de profissionais que já usam o NexusLink para escalar seus resultados.
          </p>
          <Button size="lg" asChild>
            <Link to="/dashboard">
              Acessar Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
