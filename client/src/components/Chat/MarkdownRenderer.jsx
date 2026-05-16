import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-stone-500 hover:text-stone-200 hover:bg-white/8 transition-colors"
    >
      {copied ? <Check className="w-3 h-3 text-amber-400" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export default function MarkdownRenderer({ content, className = '' }) {
  return (
    <div className={`prose-ai ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const codeText = String(children).replace(/\n$/, '');

            if (!inline && match) {
              return (
                <div className="my-3 rounded-xl overflow-hidden border border-white/[0.07]">
                  <div className="flex items-center justify-between px-4 py-2 bg-[#1c1814] border-b border-white/[0.07]">
                    <span className="text-[10px] font-medium text-stone-500 uppercase tracking-wider">
                      {match[1]}
                    </span>
                    <CopyButton text={codeText} />
                  </div>
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      borderRadius: 0,
                      background: '#141210',
                      fontSize: '12px',
                      padding: '16px',
                    }}
                    {...props}
                  >
                    {codeText}
                  </SyntaxHighlighter>
                </div>
              );
            }

            return (
              <code
                className="px-1.5 py-0.5 rounded bg-amber-900/25 text-amber-300 text-[11px] font-mono"
                {...props}
              >
                {children}
              </code>
            );
          },
          p: ({ children }) => (
            <p className="text-sm text-stone-300 leading-relaxed mb-3 last:mb-0">{children}</p>
          ),
          h1: ({ children }) => (
            <h1 className="text-base font-bold text-stone-100 mt-4 mb-2 first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-bold text-stone-100 mt-4 mb-2 first:mt-0">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold text-stone-200 mt-3 mb-1.5 first:mt-0">{children}</h3>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 mb-3 text-sm text-stone-300 ml-2">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 mb-3 text-sm text-stone-300 ml-2">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-amber-600/40 pl-3 my-3 text-stone-500 italic text-sm">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-stone-100">{children}</strong>
          ),
          em: ({ children }) => <em className="italic text-stone-400">{children}</em>,
          hr: () => <hr className="border-white/[0.08] my-4" />,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 rounded-xl border border-white/[0.07]">
              <table className="w-full text-xs text-stone-300">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-white/[0.04] text-stone-200">{children}</thead>,
          th: ({ children }) => (
            <th className="px-3 py-2 text-left font-semibold border-b border-white/[0.07]">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 border-b border-white/[0.04]">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
