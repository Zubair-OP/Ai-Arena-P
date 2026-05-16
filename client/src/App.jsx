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
  const [newChatKey, setNewChatKey] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-amber-600 border-t-transparent animate-spin" />
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
    setNewChatKey((k) => k + 1);
  };

  const handleConversationCreated = () => {
    setSidebarRefresh((n) => n + 1);
  };

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-amber-800/8 blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-orange-900/6 blur-[130px]" />
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
        <header className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.07] bg-black/25 backdrop-blur-xl flex-shrink-0">
          <button
            onClick={() => setSidebarOpen((p) => !p)}
            className="p-2 rounded-xl hover:bg-white/6 text-stone-500 hover:text-stone-200 transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-sm font-semibold gradient-text flex-shrink-0">AI Arena</span>
            {activeConversation && viewMode === 'history' && (
              <>
                <span className="text-stone-700">/</span>
                <span className="text-xs text-stone-500 truncate">
                  {activeConversation.title || 'Conversation'}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.07] rounded-xl p-1 flex-shrink-0">
            <button
              onClick={() => {
                setViewMode('arena');
                setActiveConversation(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'arena'
                  ? 'bg-amber-700/20 text-amber-300 border border-amber-600/20'
                  : 'text-stone-500 hover:text-stone-300'
              }`}
            >
              Arena
            </button>
            <button
              onClick={() => setViewMode('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'history'
                  ? 'bg-amber-700/20 text-amber-300 border border-amber-600/20'
                  : 'text-stone-500 hover:text-stone-300'
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
              key={`arena-${newChatKey}`}
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
                background: 'rgba(24, 20, 16, 0.96)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 245, 230, 0.09)',
                color: '#e8e0d5',
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
