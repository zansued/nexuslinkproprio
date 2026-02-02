import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Users, Plus, Trash2, Key, Globe, Activity, CheckCircle2, 
  XCircle, AlertTriangle, Search, Shield 
} from "lucide-react";
import { format } from "date-fns";

export default function Accounts() {
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newAccount, setNewAccount] = useState({
    domain_url: "",
    username: "",
    password: "",
    email: "",
    platform_type: "web20"
  });

  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['platform_accounts'],
    queryFn: () => base44.entities.PlatformAccount.list("-last_used"),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PlatformAccount.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['platform_accounts']);
      setIsCreating(false);
      setNewAccount({
        domain_url: "",
        username: "",
        password: "",
        email: "",
        platform_type: "web20"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PlatformAccount.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['platform_accounts'])
  });

  const [showCleanup, setShowCleanup] = useState(false);
  const [scanResults, setScanResults] = useState(null);

  const cleanupMutation = useMutation({
    mutationFn: async (action) => {
       const res = await base44.functions.invoke('cleanupAccounts', { action });
       return res.data;
    },
    onSuccess: (data, variables) => {
        if (variables === 'scan') {
            setScanResults(data);
        } else {
            queryClient.invalidateQueries(['platform_accounts']);
            setScanResults(null);
            setShowCleanup(false);
            // toast.success(data.message);
        }
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...newAccount,
      status: "active",
      success_rate: 100,
      total_posts: 0
    });
  };

  const autoRegisterMutation = useMutation({
    mutationFn: async (data) => {
      const res = await base44.functions.invoke('registerPlatformAccount', {
        domain_url: data.domain_url,
        platform_type: data.platform_type
      });
      if (res.data.status === 'error') throw new Error(res.data.error);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['platform_accounts']);
      setIsCreating(false);
      setNewAccount({
        domain_url: "",
        username: "",
        password: "",
        email: "",
        platform_type: "web20"
      });
      // You might want to show logs here via toast or modal
      console.log("Auto registration logs:", data.logs);
    },
    onError: (error) => {
      console.error(error);
    }
  });

  const handleAutoRegister = () => {
    if (!newAccount.domain_url) return;
    autoRegisterMutation.mutate({
      domain_url: newAccount.domain_url,
      platform_type: newAccount.platform_type
    });
  };

  const filteredAccounts = accounts.filter(acc => 
    acc.domain_url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-[#00ffae] text-[#050505]';
      case 'suspended': return 'bg-[#ef4444] text-white';
      case 'bad_login': return 'bg-[#fbbf24] text-[#050505]';
      default: return 'bg-[#1f1f1f] text-[#10e6f6]';
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-[#00ffae]" />
            <div>
              <h1 className="text-3xl font-bold glow-text text-[#00ffae]">
                > GERENCIADOR_DE_CONTAS_
              </h1>
              <p className="text-sm text-[#10e6f6]">
                Credenciais para automação de outreach e backlinks
              </p>
            </div>
          </div>
          <Button
            onClick={() => setIsCreating(!isCreating)}
            className="bg-[#00ffae] text-[#050505] hover:bg-[#00cc8e]"
          >
            {isCreating ? 'Cancelar' : (
              <>
                <Plus className="w-4 h-4 mr-2" /> Nova Conta
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowCleanup(!showCleanup)}
            className="bg-[#1f1f1f] border-red-900/30 text-red-400 hover:bg-red-900/10 hover:text-red-300 ml-3"
          >
             <AlertTriangle className="w-4 h-4 mr-2" /> Saúde
          </Button>
        </div>

        {/* Create Form */}
        {isCreating && (
          <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-6 mb-8 animate-in fade-in slide-in-from-top-4">
            <h2 className="text-lg font-bold text-[#00ffae] mb-4">Adicionar Nova Conta</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-[#10e6f6]">Domínio / URL</Label>
                <Input
                  required
                  value={newAccount.domain_url}
                  onChange={(e) => setNewAccount({...newAccount, domain_url: e.target.value})}
                  placeholder="https://wordpress.com"
                  className="bg-[#050505] border-[#1f1f1f] text-[#00ffae]"
                />
              </div>
              <div>
                <Label className="text-[#10e6f6]">Tipo de Plataforma</Label>
                <Select 
                  value={newAccount.platform_type} 
                  onValueChange={(val) => setNewAccount({...newAccount, platform_type: val})}
                >
                  <SelectTrigger className="bg-[#050505] border-[#1f1f1f] text-[#00ffae]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f0f0f] border-[#1f1f1f]">
                    <SelectItem value="web20">Web 2.0</SelectItem>
                    <SelectItem value="forum">Forum</SelectItem>
                    <SelectItem value="blog">Blog</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="directory">Directory</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[#10e6f6]">Username</Label>
                <Input
                  required
                  value={newAccount.username}
                  onChange={(e) => setNewAccount({...newAccount, username: e.target.value})}
                  className="bg-[#050505] border-[#1f1f1f] text-[#00ffae]"
                />
              </div>
              <div>
                <Label className="text-[#10e6f6]">Password</Label>
                <Input
                  required
                  type="password"
                  value={newAccount.password}
                  onChange={(e) => setNewAccount({...newAccount, password: e.target.value})}
                  className="bg-[#050505] border-[#1f1f1f] text-[#00ffae]"
                />
              </div>
              <div className="md:col-span-2">
                <Label className="text-[#10e6f6]">Email Associado (Opcional)</Label>
                <Input
                  type="email"
                  value={newAccount.email}
                  onChange={(e) => setNewAccount({...newAccount, email: e.target.value})}
                  className="bg-[#050505] border-[#1f1f1f] text-[#00ffae]"
                />
              </div>
              <div className="md:col-span-2 flex justify-end gap-2 mt-2 pt-4 border-t border-[#1f1f1f]">
                <Button type="button" variant="outline" onClick={() => setIsCreating(false)} className="border-[#1f1f1f] text-[#10e6f6]">
                  Cancelar
                </Button>
                
                <div className="flex-1"></div>

                <Button 
                   type="button" 
                   onClick={handleAutoRegister}
                   disabled={!newAccount.domain_url || autoRegisterMutation.isPending}
                   className="bg-[#10e6f6] text-[#050505] hover:bg-[#00ccfa] mr-2"
                >
                   {autoRegisterMutation.isPending ? (
                     <><Activity className="w-4 h-4 mr-2 animate-spin" /> Registrando com IA...</>
                   ) : (
                     <><Shield className="w-4 h-4 mr-2" /> Auto-Registrar (IA)</>
                   )}
                </Button>

                <Button type="submit" className="bg-[#00ffae] text-[#050505] hover:bg-[#00cc8e]">
                  Salvar Manualmente
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Cleanup Panel */}
        {showCleanup && (
            <div className="bg-[#0f0f0f] border border-red-900/50 rounded-lg p-6 mb-8 animate-in fade-in slide-in-from-top-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-red-500 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" /> Manutenção e Limpeza
                    </h2>
                    <Button variant="ghost" size="sm" onClick={() => setShowCleanup(false)} className="text-gray-500">
                        <XCircle className="w-4 h-4" />
                    </Button>
                </div>
                
                {!scanResults ? (
                    <div className="text-center py-8">
                        <p className="text-[#10e6f6] mb-4">Verificar contas com problemas de login, suspensas ou baixo desempenho.</p>
                        <Button 
                            onClick={() => cleanupMutation.mutate('scan')}
                            disabled={cleanupMutation.isPending}
                            className="bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20"
                        >
                            {cleanupMutation.isPending ? <Activity className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                            Escanear Problemas
                        </Button>
                    </div>
                ) : (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[#10e6f6]">
                                Encontradas <span className="font-bold text-white">{scanResults.found_count}</span> contas problemáticas.
                            </p>
                            {scanResults.found_count > 0 && (
                                <Button 
                                    onClick={() => cleanupMutation.mutate('delete')}
                                    className="bg-red-600 text-white hover:bg-red-700"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" /> Excluir Todas
                                </Button>
                            )}
                        </div>
                        {scanResults.found_count > 0 && (
                            <div className="bg-[#050505] rounded border border-[#1f1f1f] max-h-48 overflow-y-auto p-2 space-y-2">
                                {scanResults.accounts.map(acc => (
                                    <div key={acc.id} className="flex justify-between items-center text-sm p-2 hover:bg-[#1f1f1f] rounded">
                                        <div className="flex items-center gap-2">
                                            <span className="text-red-400 font-mono text-xs uppercase border border-red-900 px-1 rounded">{acc.reason}</span>
                                            <span className="text-gray-300">{acc.domain}</span>
                                        </div>
                                        <span className="text-gray-600 text-xs">{acc.username}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                         {scanResults.found_count === 0 && (
                            <div className="text-center py-4 text-green-500 flex flex-col items-center">
                                <CheckCircle2 className="w-8 h-8 mb-2" />
                                <p>Tudo limpo! Nenhuma conta problemática encontrada.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        )}

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#10e6f6]" />
            <Input
              placeholder="Buscar por domínio ou usuário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-[#050505] border-[#1f1f1f] text-[#00ffae]"
            />
          </div>
        </div>

        {/* Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAccounts.map((account) => (
            <div 
              key={account.id} 
              className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-5 hover:border-[#00ffae] transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#050505] flex items-center justify-center border border-[#1f1f1f]">
                    <Globe className="w-5 h-5 text-[#00ffae]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#00ffae] truncate max-w-[150px]" title={account.domain_url}>
                      {account.domain_url.replace(/^https?:\/\//, '')}
                    </h3>
                    <Badge variant="outline" className="text-xs border-[#1f1f1f] text-[#10e6f6]">
                      {account.platform_type}
                    </Badge>
                  </div>
                </div>
                <Badge className={getStatusColor(account.status)}>
                  {account.status}
                </Badge>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#10e6f6] flex items-center gap-2">
                    <Users className="w-3 h-3" /> User
                  </span>
                  <span className="text-[#00ffae] font-mono">{account.username}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#10e6f6] flex items-center gap-2">
                    <Key className="w-3 h-3" /> Pass
                  </span>
                  <span className="text-[#00ffae] font-mono">••••••••</span>
                </div>
                {account.email && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#10e6f6] flex items-center gap-2">
                      @ Email
                    </span>
                    <span className="text-[#00ffae] truncate max-w-[150px]">{account.email}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[#1f1f1f] grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#10e6f6] mb-1">Taxa de Sucesso</p>
                  <div className="flex items-center gap-2">
                    <Activity className="w-3 h-3 text-[#00ffae]" />
                    <span className="font-bold text-[#00ffae]">{account.success_rate}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-[#10e6f6] mb-1">Total Posts</p>
                  <span className="font-bold text-[#00ffae]">{account.total_posts}</span>
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-gray-500">
                  {account.last_used ? `Usado em ${format(new Date(account.last_used), 'dd/MM/yyyy')}` : 'Nunca usado'}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => deleteMutation.mutate(account.id)}
                  className="text-red-500 hover:text-red-400 hover:bg-red-950/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
