# NexusLink - SEO & Backlink Automation Platform

NexusLink é uma plataforma completa de automação de SEO e backlinks, projetada para ajudar profissionais de marketing digital a gerenciar campanhas de link building de forma eficiente.

## 🚀 Funcionalidades

- **Gestão de Campanhas**: Crie e gerencie campanhas de backlinks
- **Análise de Backlinks**: Analise e monitore backlinks existentes
- **Geração de Conteúdo**: Ferramentas para criação de conteúdo otimizado
- **Rastreamento de Rankings**: Monitore posições de palavras-chave
- **Gestão de Proxies**: Gerencie proxies para automação
- **Fontes de Descoberta**: Descubra oportunidades de backlinks
- **Automação**: Automatize tarefas repetitivas de SEO
- **Laboratório SEO**: Experimente e teste estratégias

## 🛠️ Tecnologias

- **Frontend**: React 18, Vite, TypeScript
- **Estilização**: Tailwind CSS, shadcn/ui
- **Estado**: React Query, React Hook Form
- **Roteamento**: React Router DOM
- **Gráficos**: Recharts
- **Animações**: Framer Motion
- **UI Components**: Radix UI, Lucide Icons

## 📦 Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd nexuslink
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
# Edite o arquivo .env.local com suas configurações
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## 🚀 Deploy no Vercel

### Pré-requisitos
- Conta no [Vercel](https://vercel.com)
- Repositório no GitHub/GitLab

### Passos para deploy

1. **Push para repositório remoto**:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Importar no Vercel**:
   - Acesse [vercel.com/new](https://vercel.com/new)
   - Importe seu repositório
   - Configure as variáveis de ambiente (opcional)
   - Clique em "Deploy"

3. **Variáveis de ambiente no Vercel**:
   - Vá para Project Settings > Environment Variables
   - Adicione as variáveis necessárias do `.env.example`

### Configuração Automática
O projeto já inclui `vercel.json` com configurações otimizadas para Vercel.

## 🔧 Configuração

### Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto:

```env
# Configuração da API
VITE_API_URL=http://localhost:3000/api
VITE_APP_ID=nexuslink-app

# Configurações de SEO
VITE_DEFAULT_DOMAIN=seusite.com
VITE_ANALYTICS_ID=UA-XXXXX-Y

# Configurações de Email (opcional)
VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_PORT=587
VITE_SMTP_USER=seu-email@gmail.com
VITE_SMTP_PASS=sua-senha-app

# Configurações de Proxy (opcional)
VITE_PROXY_API_KEY=sua-chave-api
VITE_PROXY_SERVICE_URL=https://api.proxy-service.com
```

### Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run preview` - Pré-visualiza build de produção
- `npm run lint` - Executa ESLint
- `npm run typecheck` - Verifica tipos TypeScript

## 📁 Estrutura do Projeto

```
nexuslink/
├── src/
│   ├── api/           # Clientes e integrações de API
│   ├── components/    # Componentes React
│   │   ├── ui/       # Componentes UI reutilizáveis
│   │   ├── campaign/ # Componentes de campanha
│   │   └── dashboard/# Componentes do dashboard
│   ├── hooks/        # Custom hooks
│   ├── lib/          # Utilitários e configurações
│   ├── pages/        # Páginas da aplicação
│   ├── utils/        # Funções utilitárias
│   └── assets/       # Arquivos estáticos
├── functions/        # Funções serverless (antigas do base44)
├── public/          # Arquivos públicos
└── dist/            # Build de produção
```

## 🎨 Personalização

### Tema
O projeto usa Tailwind CSS com suporte a temas claro/escuro. Para personalizar:

1. Edite `tailwind.config.js` para cores e estilos
2. Modifique `src/index.css` para estilos globais

### Componentes UI
Os componentes usam shadcn/ui com Radix UI. Para adicionar novos componentes:

```bash
# Exemplo de adição de componente
npx shadcn-ui@latest add button
```

## 🔒 Segurança

- Use HTTPS em produção
- Não comite arquivos `.env`
- Valide inputs do usuário
- Use variáveis de ambiente para dados sensíveis

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🆘 Suporte

Para suporte, abra uma issue no repositório ou entre em contato através do email de suporte.

---

**Nota**: Este projeto foi adaptado para deploy no Vercel e não possui mais dependências do base44 SDK. Todas as integrações foram substituídas por mocks que podem ser implementadas conforme necessário.
