import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';
import FileUpload from './FileUpload';

export default function ChatInput({ onSend, disabled }) {
  const [query, setQuery] = useState('');
  const [file, setFile] = useState(null);
  const textareaRef = useRef(null);

  const handleSend = () => {
    if (!query.trim() && !file) return;
    onSend(query.trim(), file);
    setQuery('');
    setFile(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e) => {
    setQuery(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
    }
  };

  return (
    <div className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-xl">
      <div className="max-w-4xl mx-auto">
        {file && (
          <div className="mb-2 flex">
            <FileUpload file={file} onFileSelect={setFile} onClear={() => setFile(null)} />
          </div>
        )}
        <div className="flex items-end gap-2 glass rounded-2xl px-3 py-2">
          {!file && (
            <FileUpload file={null} onFileSelect={setFile} onClear={() => setFile(null)} />
          )}
          <textarea
            ref={textareaRef}
            value={query}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Ask anything… (Shift+Enter for new line)"
            rows={1}
            className="flex-1 bg-transparent resize-none text-sm text-white placeholder-slate-500 focus:outline-none py-1.5 leading-relaxed disabled:opacity-50"
            style={{ maxHeight: '160px', overflowY: 'auto' }}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={disabled || (!query.trim() && !file)}
            className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all flex-shrink-0"
          >
            {disabled ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </motion.button>
        </div>
        <p className="text-center text-[10px] text-slate-600 mt-2">
          AI Arena may produce inaccurate information.
        </p>
      </div>
    </div>
  );
}
