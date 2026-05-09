import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Login from '../components/Auth/Login';
import Register from '../components/Auth/Register';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) return null;
  if (user) return <Navigate to="/arena" replace />;

  const isRegister = location.pathname === '/register';

  return (
    <div className="fixed inset-0 overflow-y-auto">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-cyan-500/8 blur-[100px]" />
        <div className="absolute top-3/4 left-1/2 w-[300px] h-[300px] rounded-full bg-purple-500/6 blur-[80px]" />
      </div>

      <div className="flex min-h-full items-center justify-center px-4 py-12">
        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold gradient-text mb-1">AI Arena</h1>
            <p className="text-slate-400 text-xs">Battle of the Models</p>
          </div>

          <AnimatePresence mode="wait">
            {!isRegister ? (
              <Login key="login" onSwitch={() => navigate('/register')} />
            ) : (
              <Register key="register" onSwitch={() => navigate('/login')} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
