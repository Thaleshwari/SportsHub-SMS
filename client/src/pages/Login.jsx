import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, reset } from '../redux/slices/authSlice';
import { motion } from 'framer-motion';
import { Trophy, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const { email, password } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (user) {
      navigate('/');
    }
    // We don't dispatch reset here to keep the error message visible if it exists
  }, [user, navigate]);

  const onChange = (e) => {
    if (isError) dispatch(reset());
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(login(formData));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#081120] relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl flex rounded-3xl overflow-hidden glass-card shadow-2xl border-white/10"
      >
        {/* Left Side - Illustration/Image */}
        <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary to-secondary p-12 flex-col justify-between relative">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <Trophy className="text-white" size={32} />
              <h2 className="text-2xl font-bold tracking-tight">SportsHub</h2>
            </div>
            <h3 className="text-4xl font-bold leading-tight mb-4">
              Manage Your <br /> 
              <span className="text-white/80">Tournaments Like A Pro</span>
            </h3>
            <p className="text-white/70 text-lg max-w-sm">
              The ultimate platform for organizers, teams, and fans. Real-time scoring, automated fixtures, and advanced analytics.
            </p>
          </div>

          <div className="relative z-10">
            <div className="flex -space-x-4 mb-4">
              {[1, 2, 3, 4].map((i) => (
                <img 
                  key={i}
                  src={`https://i.pravatar.cc/150?u=${i}`} 
                  alt="User" 
                  className="w-10 h-10 rounded-full border-2 border-white/20"
                />
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-white/20 bg-white/10 backdrop-blur-md flex items-center justify-center text-xs font-bold">
                +1k
              </div>
            </div>
            <p className="text-sm font-medium text-white/80">Joined by 1000+ tournament organizers</p>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-1/2 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
            <p className="text-textSecondary">Please enter your details to sign in</p>
          </div>

          {isError && (
            <div className="mb-6 p-4 bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl animate-shake">
              {message}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-textSecondary ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" size={20} />
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  className="w-full glass-input pl-12"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-textSecondary ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={password}
                  onChange={onChange}
                  className="w-full glass-input pl-12 pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-textSecondary hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between ml-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-white/5 accent-primary" />
                <span className="text-sm text-textSecondary group-hover:text-white transition-colors">Remember me</span>
              </label>
              <button type="button" className="text-sm text-primary hover:underline font-medium">Forgot password?</button>
            </div>

            <button type="submit" disabled={isLoading} className="w-full btn-primary flex items-center justify-center gap-2">
              {isLoading ? 'Signing in...' : 'Sign In'}
              {!isLoading && <ArrowRight size={20} />}
            </button>
          </form>

          <p className="mt-8 text-center text-textSecondary">
            Don't have an account? {' '}
            <Link to="/register" className="text-primary hover:underline font-medium">Create Account</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
