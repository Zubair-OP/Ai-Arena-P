import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu } from 'lucide-react';

import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Sidebar from './components/Sidebar/Sidebar';
import ArenaPage from './pages/ArenaPage';
import HistoryPage from './pages/HistoryPage';
import AuthPage from './pages/AuthPage';

function ProtectedLayout() {
  const { user, loading } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeConversation, setActiveConversation] = useState(null);
  const [viewMode, setViewMode] = useState('arena');
  const [sidebarRefresh, setSidebarRefresh] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const handleSelectConversation = (conv) => {
    setActiveConversation(conv);
    setViewMode('history');
    setSidebarOpen(false);
  };

  const handleNewChat = () => {
    setActiveConversation(null);
    setViewMode('arena');
    setSidebarOpen(false);
  };

  const handleConversationCreated = () => {
    setSidebarRefresh((n) => n + 1);
  };

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-purple-600/8 blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/6 blur-[120px]" />
      </div>

      {/* Desktop sidebar */}
      <div
        className="flex-shrink-0 hidden lg:block transition-all duration-300"
        style={{ width: sidebarOpen ? '280px' : '0px', overflow: 'hidden' }}
      >
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeConversationId={activeConversation?._id || activeConversation?.id}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
          refreshTrigger={sidebarRefresh}
        />
      </div>

      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeConversationId={activeConversation?._id || activeConversation?.id}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
          refreshTrigger={sidebarRefresh}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-black/20 backdrop-blur-xl flex-shrink-0">
          <button
            onClick={() => setSidebarOpen((p) => !p)}
            className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-sm font-semibold gradient-text flex-shrink-0">AI Arena</span>
            {activeConversation && viewMode === 'history' && (
              <>
                <span className="text-slate-600">/</span>
                <span className="text-xs text-slate-400 truncate">
                  {activeConversation.title || 'Conversation'}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1 flex-shrink-0">
            <button
              onClick={() => {
                setViewMode('arena');
                setActiveConversation(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'arena'
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Arena
            </button>
            <button
              onClick={() => setViewMode('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'history'
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              History
            </button>
          </div>
        </header>

        {/* Page content */}
        <AnimatePresence mode="wait">
          {viewMode === 'arena' ? (
            <motion.div
              key="arena"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col min-h-0 overflow-hidden"
            >
              <ArenaPage
                conversationId={activeConversation?._id || activeConversation?.id}
                onConversationCreated={handleConversationCreated}
              />
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col min-h-0 overflow-hidden"
            >
              <HistoryPage conversation={activeConversation} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgba(15, 15, 35, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#f1f5f9',
                borderRadius: '12px',
                fontSize: '13px',
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />
            <Route path="/arena" element={<ProtectedLayout />} />
            <Route path="/" element={<Navigate to="/arena" replace />} />
            <Route path="*" element={<Navigate to="/arena" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
