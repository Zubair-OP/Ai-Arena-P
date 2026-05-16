import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileText } from 'lucide-react';
import ModelPanel from '../components/Arena/ModelPanel';
import JudgePanel from '../components/Arena/JudgePanel';
import ChatInput from '../components/Chat/ChatInput';
import { useSocket } from '../context/SocketContext';
import { useStream } from '../hooks/useStream';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ArenaPage({ conversationId, onConversationCreated }) {
  const { socket } = useSocket();
  const {
    modelAText,
    modelBText,
    judgeText,
    ratings,
    winner,
    isStreaming,
    streamPhase,
    resetStream,
  } = useStream(socket);

  const [currentConvId, setCurrentConvId] = useState(conversationId || null);
  const judgeRef = useRef(null);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    setCurrentConvId(conversationId || null);
    resetStream();
  }, [conversationId]);

  useEffect(() => {
    if (streamPhase === 'complete' && judgeRef.current) {
      judgeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [streamPhase]);

  // Keep latest judge tokens visible while the judge streams
  useEffect(() => {
    if (scrollContainerRef.current && streamPhase === 'judge') {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [judgeText, streamPhase]);

  const handleSend = async (query, file) => {
    if (!query && !file) return;

    resetStream();

    try {
      let convId = currentConvId;

      const socketId = socket?.id;

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const { data: uploadData } = await api.post('/api/rag/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const fileId = uploadData.data.fileId;

        const { data } = await api.post('/api/rag/query-with-file', {
          query,
          fileId,
          conversationId: convId,
          socketId,
        });

        if (!convId) {
          convId = data.data.conversationId;
          setCurrentConvId(convId);
          onConversationCreated?.(convId);
        }
      } else {
        const { data } = await api.post('/api/arena/query', {
          query,
          conversationId: convId,
          socketId,
        });

        if (!convId) {
          convId = data.data.conversationId;
          setCurrentConvId(convId);
          onConversationCreated?.(convId);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Query failed');
    }
  };

  const showJudge = streamPhase === 'judge' || streamPhase === 'complete';

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Scrollable content area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto min-h-0 p-4 space-y-4">
        {/* Model panels side by side */}
        <div className="flex gap-4 items-start">
          <ModelPanel
            model="Mixtral"
            text={modelAText}
            isStreaming={isStreaming && streamPhase === 'models'}
            color="purple"
          />
          <ModelPanel
            model="Gemini"
            text={modelBText}
            isStreaming={isStreaming && streamPhase === 'models'}
            color="cyan"
          />
        </div>

        {/* Judge panel below — stays visible, doesn't push models away */}
        <div ref={judgeRef}>
          <JudgePanel
            text={judgeText}
            ratings={ratings}
            winner={winner}
            isVisible={showJudge}
            streamPhase={streamPhase}
          />
        </div>
      </div>

      {/* Input fixed at bottom */}
      <ChatInput onSend={handleSend} disabled={isStreaming} />
    </div>
  );
}
