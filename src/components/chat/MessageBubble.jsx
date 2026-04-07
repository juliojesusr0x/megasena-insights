import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle2, AlertCircle, Loader2, ChevronRight, Clock, Zap } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const FunctionDisplay = ({ toolCall }) => {
  const [expanded, setExpanded] = useState(false);
  const name = toolCall?.name || 'Consultando dados';
  const status = toolCall?.status || 'pending';

  const statusConfig = {
    pending: { icon: Clock, color: 'text-slate-400', text: 'Aguardando' },
    running: { icon: Loader2, color: 'text-emerald-500', text: 'Consultando...', spin: true },
    in_progress: { icon: Loader2, color: 'text-emerald-500', text: 'Consultando...', spin: true },
    completed: { icon: CheckCircle2, color: 'text-emerald-600', text: 'Concluído' },
    success: { icon: CheckCircle2, color: 'text-emerald-600', text: 'Concluído' },
    failed: { icon: AlertCircle, color: 'text-red-500', text: 'Erro' },
    error: { icon: AlertCircle, color: 'text-red-500', text: 'Erro' },
  }[status] || { icon: Zap, color: 'text-slate-500', text: '' };

  const Icon = statusConfig.icon;
  const formattedName = name.replace(/_/g, ' ').replace(/\./g, ' › ');

  return (
    <div className="mt-1 text-xs">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-all"
      >
        <Icon className={cn("h-3 w-3", statusConfig.color, statusConfig.spin && "animate-spin")} />
        <span className="text-slate-600">{formattedName}</span>
        {statusConfig.text && <span className="text-slate-400">• {statusConfig.text}</span>}
        {!statusConfig.spin && toolCall.results && (
          <ChevronRight className={cn("h-3 w-3 text-slate-400 ml-auto transition-transform", expanded && "rotate-90")} />
        )}
      </button>
    </div>
  );
};

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mt-0.5 flex-shrink-0">
          <span className="text-white text-xs font-bold">AI</span>
        </div>
      )}
      <div className={cn("max-w-[85%]", isUser && "flex flex-col items-end")}>
        {message.content && (
          <div className={cn(
            "rounded-2xl px-4 py-3",
            isUser
              ? "bg-emerald-500 text-white"
              : "bg-white border border-slate-200 shadow-sm"
          )}>
            {isUser ? (
              <p className="text-sm leading-relaxed">{message.content}</p>
            ) : (
              <ReactMarkdown
                className="text-sm prose prose-sm prose-slate max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                components={{
                  code: ({ inline, className, children }) => {
                    return !inline ? (
                      <pre className="bg-slate-900 text-slate-100 rounded-lg p-3 overflow-x-auto my-2 text-xs">
                        <code>{children}</code>
                      </pre>
                    ) : (
                      <code className="px-1 py-0.5 rounded bg-slate-100 text-slate-700 text-xs">{children}</code>
                    );
                  },
                  p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="my-1 ml-4 list-disc">{children}</ul>,
                  ol: ({ children }) => <ol className="my-1 ml-4 list-decimal">{children}</ol>,
                  li: ({ children }) => <li className="my-0.5">{children}</li>,
                  h2: ({ children }) => <h2 className="text-base font-semibold my-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-semibold my-2">{children}</h3>,
                  strong: ({ children }) => <strong className="font-semibold text-slate-800">{children}</strong>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        )}
        {message.tool_calls?.length > 0 && (
          <div className="space-y-1 mt-1">
            {message.tool_calls.map((toolCall, idx) => (
              <FunctionDisplay key={idx} toolCall={toolCall} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}