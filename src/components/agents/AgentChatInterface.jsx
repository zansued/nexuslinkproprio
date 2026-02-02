import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
    Send, Bot, User, Loader2, Terminal, Copy, Check, 
    Cpu, PenTool, Globe, ChevronRight, Search 
} from 'lucide-react';
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";

const AgentAvatar = ({ agent }) => {
    const icons = {
        master_seo: Cpu,
        content_creator: PenTool,
        outreach_specialist: Globe,
        source_hunter: Search
    };
    const Icon = icons[agent] || Bot;
    
    return (
        <div className={cn(
            "w-8 h-8 rounded border flex items-center justify-center",
            agent === 'master_seo' ? "bg-purple-900/20 border-purple-500 text-purple-400" :
            agent === 'content_creator' ? "bg-blue-900/20 border-blue-500 text-blue-400" :
            agent === 'outreach_specialist' ? "bg-green-900/20 border-green-500 text-green-400" :
            agent === 'source_hunter' ? "bg-yellow-900/20 border-yellow-500 text-yellow-400" :
            "bg-gray-800 border-gray-600"
        )}>
            <Icon className="w-4 h-4" />
        </div>
    );
};

const MessageBubble = ({ message, agent }) => {
    const isUser = message.role === 'user';
    const [copied, setCopied] = useState(false);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={cn("flex gap-3 mb-4", isUser ? "justify-end" : "justify-start")}>
            {!isUser && <AgentAvatar agent={agent} />}
            
            <div className={cn(
                "max-w-[85%] rounded-lg p-4 border",
                isUser 
                    ? "bg-[#00ffae]/10 border-[#00ffae]/30 text-[#00ffae]" 
                    : "bg-[#0f0f0f] border-[#1f1f1f] text-[#10e6f6]"
            )}>
                <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown
                        components={{
                            code: ({ inline, className, children, ...props }) => {
                                const match = /language-(\w+)/.exec(className || '');
                                const codeText = String(children).replace(/\n$/, '');
                                
                                return !inline ? (
                                    <div className="relative group mt-2 mb-2">
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-6 w-6 bg-[#050505] hover:bg-[#1f1f1f] text-[#00ffae]"
                                                onClick={() => handleCopy(codeText)}
                                            >
                                                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                            </Button>
                                        </div>
                                        <pre className="bg-[#050505] p-3 rounded border border-[#1f1f1f] overflow-x-auto">
                                            <code className={className} {...props}>{children}</code>
                                        </pre>
                                    </div>
                                ) : (
                                    <code className="bg-[#050505] px-1 py-0.5 rounded text-[#00ffae]" {...props}>
                                        {children}
                                    </code>
                                );
                            }
                        }}
                    >
                        {message.content}
                    </ReactMarkdown>
                </div>

                {/* Tool Calls Display */}
                {message.tool_calls?.map((tool, idx) => (
                    <div key={idx} className="mt-2 text-xs border-t border-[#1f1f1f] pt-2">
                        <div className="flex items-center gap-2 text-gray-500">
                            <Terminal className="w-3 h-3" />
                            <span>Executando: {tool.name}</span>
                        </div>
                        {tool.results && (
                            <div className="mt-1 bg-[#050505] p-2 rounded text-gray-400 font-mono overflow-hidden text-ellipsis whitespace-nowrap">
                                Result: {JSON.stringify(tool.results).substring(0, 50)}...
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {isUser && (
                <div className="w-8 h-8 rounded bg-[#00ffae]/20 border border-[#00ffae] flex items-center justify-center text-[#00ffae]">
                    <User className="w-4 h-4" />
                </div>
            )}
        </div>
    );
};

export default function AgentChatInterface({ selectedAgent }) {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [conversationId, setConversationId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    // Initialize conversation
    useEffect(() => {
        const initConversation = async () => {
            try {
                // List existing conversations or create new
                const convs = await base44.agents.listConversations({ agent_name: selectedAgent });
                if (convs && convs.length > 0) {
                    setConversationId(convs[0].id);
                    setMessages(convs[0].messages || []);
                } else {
                    const newConv = await base44.agents.createConversation({
                        agent_name: selectedAgent,
                        metadata: { name: `Chat with ${selectedAgent}` }
                    });
                    setConversationId(newConv.id);
                    setMessages([]);
                }
            } catch (error) {
                console.error("Failed to init conversation:", error);
            }
        };

        if (selectedAgent) {
            initConversation();
        }
    }, [selectedAgent]);

    // Subscribe to updates
    useEffect(() => {
        if (!conversationId) return;

        const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
            setMessages(data.messages);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [conversationId]);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || !conversationId) return;

        const content = inputValue;
        setInputValue("");
        setIsLoading(true);

        try {
            await base44.agents.addMessage({ id: conversationId }, {
                role: "user",
                content: content
            });
        } catch (error) {
            console.error("Error sending message:", error);
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-[#1f1f1f] bg-[#050505] flex items-center gap-3">
                <AgentAvatar agent={selectedAgent} />
                <div>
                    <h3 className="font-bold text-[#00ffae] capitalize">
                        {selectedAgent.replace('_', ' ')}
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs text-[#10e6f6]">Online & Ready</span>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-[#1f1f1f]">
                        <Terminal className="w-12 h-12 mb-4 opacity-20" />
                        <p className="text-sm text-gray-500">Inicie uma operação com o agente...</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <MessageBubble key={idx} message={msg} agent={selectedAgent} />
                    ))
                )}
                {isLoading && (
                    <div className="flex items-center gap-2 text-[#00ffae] text-sm animate-pulse ml-12">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processando...</span>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#050505] border-t border-[#1f1f1f]">
                <div className="flex gap-2">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder={`Comando para ${selectedAgent.replace('_', ' ')}...`}
                        className="bg-[#0f0f0f] border-[#1f1f1f] text-[#00ffae] focus-visible:ring-[#00ffae]"
                        disabled={isLoading}
                    />
                    <Button 
                        onClick={handleSendMessage}
                        disabled={isLoading || !inputValue.trim()}
                        className="bg-[#00ffae] text-[#050505] hover:bg-[#00cc8e]"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                </div>
            </div>
        </div>
    );
}
