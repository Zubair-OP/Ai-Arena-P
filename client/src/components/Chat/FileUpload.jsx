import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Paperclip, X, FileText } from 'lucide-react';

export default function FileUpload({ file, onFileSelect, onClear }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && isValidFile(dropped)) onFileSelect(dropped);
  };

  const isValidFile = (f) =>
    ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'].includes(f.type) ||
    f.name.endsWith('.pdf') ||
    f.name.endsWith('.docx') ||
    f.name.endsWith('.txt');

  const handleChange = (e) => {
    const selected = e.target.files[0];
    if (selected) onFileSelect(selected);
    e.target.value = '';
  };

  if (file) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-700/10 border border-amber-600/15"
      >
        <FileText className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
        <span className="text-xs text-amber-300 truncate max-w-[160px]">{file.name}</span>
        <button
          onClick={onClear}
          className="p-0.5 rounded-md hover:bg-amber-600/15 text-amber-500 hover:text-amber-200 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </motion.div>
    );
  }

  return (
    <>
      <button
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`p-2 rounded-xl transition-all ${
          dragging
            ? 'bg-amber-700/15 border border-amber-600/30 text-amber-300'
            : 'hover:bg-white/6 text-stone-500 hover:text-stone-300'
        }`}
        title="Attach file (PDF, DOCX, TXT)"
      >
        <Paperclip className="w-4 h-4" />
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        onChange={handleChange}
        className="hidden"
      />
    </>
  );
}
