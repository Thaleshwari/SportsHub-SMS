import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, reset } from '../redux/slices/authSlice';
import { motion } from 'framer-motion';
import { Trophy, Mail, Lock, User, UserCircle, ArrowRight } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Organizer',
  });

  const { name, email, password, role } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (user) {
      navigate('/');
    }
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
    dispatch(register(formData));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#081120] relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg p-8 lg:p-12 rounded-3xl glass-card shadow-2xl border-white/10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-2xl mb-4 neon-glow">
            <Trophy className="text-primary" size={32} />
          </div>
          <h2 className="text-3xl font-bold mb-2">Create Account</h2>
          <p className="text-textSecondary">Join the future of sports management</p>
        </div>

        {isError && (
          <div className="mb-6 p-4 bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl animate-shake">
            {message}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-medium text-textSecondary ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" size={20} />
              <input
                type="text"
                name="name"
                value={name}
                onChange={onChange}
                className="w-full glass-input pl-12"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
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

          <div className="space-y-1">
            <label className="text-sm font-medium text-textSecondary ml-1">Account Role</label>
            <div className="relative">
              <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" size={20} />
              <select
                name="role"
                value={role}
                onChange={onChange}
                className="w-full glass-input pl-12 appearance-none cursor-pointer"
              >
                <option value="Organizer" className="bg-background">Organizer</option>
                <option value="Team Captain" className="bg-background">Team Captain</option>
                <option value="Admin" className="bg-background">Admin</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-textSecondary ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" size={20} />
              <input
                type="password"
                name="password"
                value={password}
                onChange={onChange}
                className="w-full glass-input pl-12"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full btn-primary flex items-center justify-center gap-2 mt-4">
            {isLoading ? 'Creating account...' : 'Get Started'}
            {!isLoading && <ArrowRight size={20} />}
          </button>
        </form>

        <p className="mt-8 text-center text-textSecondary">
          Already have an account? {' '}
          <Link to="/login" className="text-primary hover:underline font-medium">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
