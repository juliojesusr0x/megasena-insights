import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Sparkles, RotateCcw } from 'lucide-react';
import { cn } from "@/lib/utils";
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import MessageBubble from '@/components/chat/MessageBubble';

const SUGGESTED_QUESTIONS = [
  "Quais são os números mais sorteados de todos os tempos?",
  "Qual a melhor estratégia para montar uma aposta equilibrada?",
  "Quais números estão mais 'atrasados' para sair?",
  "Me explique a análise de gaps da Mega-Sena",
  "Qual a soma ideal para uma combinação estatisticamente favorável?",
  "Gere uma combinação baseada nos dados históricos",
];

export default function AIChat() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    initConversation();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initConversation = async () => {
    setIsInitializing(true);
    const conv = await base44.agents.createConversation({
      agent_name: 'megastats_ai',
      metadata: { name: 'Chat MegaStats AI' },
    });
    setConversation(conv);
    setMessages(conv.messages || []);
    setIsInitializing(false);

    base44.agents.subscribeToConversation(conv.id, (data) => {
      setMessages([...data.messages]);
    });
  };

  const handleSend = async (text) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;
    setInput('');
    setIsLoading(true);

    await base44.agents.addMessage(conversation, {
      role: 'user',
      content: messageText,
    });

    setIsLoading(false);
  };

  const handleReset = async () => {
    setMessages([]);
    setConversation(null);
    await initConversation();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isTyping = messages.length > 0 &&
    messages[messages.length - 1]?.role === 'user' &&
    isLoading;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-200 bg-white/80 backdrop-blur px-4 py-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900">MegaStats AI</h1>
                <p className="text-xs text-slate-500">Especialista em estatísticas e probabilidades da Mega-Sena</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleReset} className="text-slate-500 gap-2">
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Nova conversa</span>
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {isInitializing ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Olá! Sou o MegaStats AI</h2>
                <p className="text-slate-500 mb-8 max-w-md mx-auto text-sm">
                  Sou especialista nos dados históricos da Mega-Sena. Posso analisar estatísticas, 
                  identificar padrões e ajudar com estratégias de apostas.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl mx-auto">
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(q)}
                      className="text-left px-4 py-3 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50 text-sm text-slate-600 transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <MessageBubble key={idx} message={msg} />
                ))}
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">AI</span>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
                      <div className="flex gap-1 items-center h-4">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-slate-200 bg-white px-4 py-4">
          <div className="max-w-3xl mx-auto flex gap-3 items-end">
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pergunte sobre estatísticas, padrões ou estratégias da Mega-Sena..."
              className="flex-1 min-h-[44px] max-h-32 resize-none rounded-xl border-slate-200 focus:border-emerald-400"
              rows={1}
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading || isInitializing}
              className="bg-emerald-500 hover:bg-emerald-600 h-11 w-11 p-0 rounded-xl flex-shrink-0"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-center text-xs text-slate-400 mt-2">
            Para fins educacionais. A Mega-Sena é um jogo de azar — nenhuma estratégia garante ganhos.
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}