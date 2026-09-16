import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { login as apiLogin, signup as apiSignup } from '../lib/api';
import { NeoCard } from '../components/NeoCard';
import { NeoButton } from '../components/NeoButton';

const DEMO_USERS = [
  { email: 'demo1@dynaprice.com', password: 'password123' },
  { email: 'demo2@dynaprice.com', password: 'password123' },
  { email: 'demo3@dynaprice.com', password: 'password123' },
];

export const Login: React.FC = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to where they were trying to go, or home
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }
    
    if (!isLoginMode && password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      if (isLoginMode) {
        const data = await apiLogin(email, password);
        login(data);
        toast.success(`Welcome back, ${data.user.name}!`, {
          style: { border: '3px solid #000', borderRadius: '0', fontWeight: 'bold' }
        });
      } else {
        const data = await apiSignup(email, password);
        login(data);
        toast.success(`Account created for ${data.user.name}!`, {
          style: { border: '3px solid #000', borderRadius: '0', fontWeight: 'bold' }
        });
      }
      localStorage.removeItem('dynaprice_instructions_seen');
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoUser = () => {
    const randomUser = DEMO_USERS[Math.floor(Math.random() * DEMO_USERS.length)];
    setEmail(randomUser.email);
    setPassword(randomUser.password);
    setIsLoginMode(true); // switch to login tab if they were on signup
    setError(null);
    toast('Demo user credentials loaded', {
      icon: '⚡',
      style: { border: '3px solid #000', borderRadius: '0', fontWeight: 'bold', background: '#FFE500', color: '#000' }
    });
  };

  return (
    <div className="min-h-screen bg-neo-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-black mx-auto flex items-center justify-center border-4 border-black mb-4 shadow-neo">
            <span className="text-neo-yellow font-black text-2xl select-none">DP</span>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tight text-black">
            DynaPrice
          </h1>
          <p className="font-bold text-gray-600 mt-2">
            Sign in to access the pricing dashboard
          </p>
        </div>

        <NeoCard accent="border-t-neo-yellow" className="p-6 sm:p-8">
          <div className="flex border-b-3 border-black mb-6">
            <button
              type="button"
              className={`flex-1 py-3 font-black uppercase tracking-widest text-sm transition-colors ${
                isLoginMode ? 'bg-neo-yellow text-black' : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-black'
              }`}
              onClick={() => setIsLoginMode(true)}
            >
              Login
            </button>
            <div className="w-1 bg-black" />
            <button
              type="button"
              className={`flex-1 py-3 font-black uppercase tracking-widest text-sm transition-colors ${
                !isLoginMode ? 'bg-neo-pink text-black' : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-black'
              }`}
              onClick={() => setIsLoginMode(false)}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-3 border-black p-3 font-bold bg-white focus:outline-none focus:bg-yellow-50 focus:shadow-neo transition-all"
                placeholder="you@example.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-black uppercase tracking-widest mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-3 border-black p-3 font-bold bg-white focus:outline-none focus:bg-yellow-50 focus:shadow-neo transition-all"
                placeholder="••••••••"
                minLength={isLoginMode ? undefined : 6}
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-neo-red text-white border-[3px] border-black px-4 py-3 font-bold text-sm">
                ⚠️ {error}
              </div>
            )}

            <NeoButton 
              type="submit" 
              variant={isLoginMode ? 'primary' : 'danger'} 
              size="lg" 
              className="w-full mt-2"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : isLoginMode ? 'Login to Dashboard' : 'Create Account'}
            </NeoButton>
          </form>

          <div className="mt-8 border-t-2 border-dashed border-gray-300 pt-6">
            <p className="text-center text-xs font-bold text-gray-500 mb-4 uppercase tracking-wider">
              For Demonstration Purposes
            </p>
            <NeoButton 
              type="button" 
              variant="secondary" 
              className="w-full"
              onClick={fillDemoUser}
            >
              ⚡ Fill with Demo User
            </NeoButton>
          </div>
        </NeoCard>
      </div>
    </div>
  );
};
