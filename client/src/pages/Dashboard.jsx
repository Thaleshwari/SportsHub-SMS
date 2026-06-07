import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTournaments, createTournament } from '../redux/slices/tournamentSlice';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Users, Activity, TrendingUp, ChevronRight, Clock, MapPin, X, Plus, Calendar, Settings, Check, Play, Square, Minus 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', value: 10 },
  { name: 'Feb', value: 25 },
  { name: 'Mar', value: 45 },
  { name: 'Apr', value: 30 },
  { name: 'May', value: 65 },
  { name: 'Jun', value: 85 },
];

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass-card p-6 flex items-center justify-between"
  >
    <div>
      <p className="text-textSecondary text-sm font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-bold">{value}</h3>
      <div className={`flex items-center gap-1 mt-2 text-xs ${trend >= 0 ? 'text-success' : 'text-danger'}`}>
        <TrendingUp size={14} className={trend < 0 ? 'rotate-180' : ''} />
        <span>{Math.abs(trend)}% from last month</span>
      </div>
    </div>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${color}/10 text-${color}`}>
      <Icon size={24} />
    </div>
  </motion.div>
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { tournaments, isLoading } = useSelector((state) => state.tournament);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '', sportType: 'Football', format: 'Knockout', venue: '', startDate: '', endDate: ''
  });

  const [showTeamsModal, setShowTeamsModal] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [tournamentTeams, setTournamentTeams] = useState([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);

  const [showFixturesModal, setShowFixturesModal] = useState(false);
  const [generatedFixtures, setGeneratedFixtures] = useState([]);

  const [showLiveControlModal, setShowLiveControlModal] = useState(false);
  const [tournamentMatches, setTournamentMatches] = useState([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);

  useEffect(() => {
    dispatch(fetchTournaments());
  }, [dispatch]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createTournament(formData)).unwrap();
      setShowCreateModal(false);
      setFormData({ title: '', sportType: 'Football', format: 'Knockout', venue: '', startDate: '', endDate: '' });
      alert('Tournament created successfully!');
    } catch (err) {
      alert(err || 'Failed to create tournament. Please check all fields.');
    }
  };

  const handleGenerateFixtures = async (tournamentId) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/matches/generate/${tournamentId}`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setGeneratedFixtures(res.data);
      setShowFixturesModal(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Error generating fixtures. Remember, you need at least 2 approved teams.');
    }
  };

  const handleManageTeams = async (tournament) => {
    setSelectedTournament(tournament);
    setShowTeamsModal(true);
    setIsLoadingTeams(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/teams/tournament/${tournament._id}`);
      setTournamentTeams(res.data);
    } catch (err) {
      alert('Failed to load teams');
    } finally {
      setIsLoadingTeams(false);
    }
  };

  const handleUpdateTeamStatus = async (teamId, status) => {
    try {
      await axios.put(`http://localhost:5000/api/teams/${teamId}/status`, { status }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setTournamentTeams(tournamentTeams.map(t => t._id === teamId ? { ...t, status } : t));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  // Filter tournaments to only show ones created by the logged in organizer (unless Admin)
  const myTournaments = (tournaments || []).filter(t => {
    if (!user || !t) return false;
    if (user.role === 'Admin') return true;
    const orgId = t.organizer?._id || t.organizer;
    return String(orgId) === String(user._id);
  });

  const handleOpenLiveControl = async (tournament) => {
    setSelectedTournament(tournament);
    setShowLiveControlModal(true);
    setIsLoadingMatches(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/matches/tournament/${tournament._id}`);
      setTournamentMatches(res.data);
    } catch (err) {
      alert('Failed to load matches');
    } finally {
      setIsLoadingMatches(false);
    }
  };

  const handleUpdateMatch = async (matchId, updates) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/matches/${matchId}/score`, updates, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setTournamentMatches(tournamentMatches.map(m => m._id === matchId ? res.data : m));
    } catch (err) {
      alert('Failed to update match');
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome Back, {user?.name}!</h1>
          <p className="text-textSecondary text-lg">Manage your tournaments and generate fixtures effortlessly.</p>
        </div>
        {(user?.role === 'Organizer' || user?.role === 'Admin') && (
          <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2 shadow-lg shadow-primary/20">
            <Plus size={20} />
            <span>New Tournament</span>
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="My Tournaments" value={myTournaments.length} icon={Trophy} color="primary" trend={12} />
        <StatCard title="Registered Teams" value={myTournaments.length * 8} icon={Users} color="secondary" trend={5.4} />
        <StatCard title="Platform Active Users" value="3,240" icon={Activity} color="success" trend={24} />
        <StatCard title="Total Matches Played" value="156" icon={TrendingUp} color="primary" trend={18} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Tournament Participation Trends</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Management Panel */}
        <div className="glass-card p-8 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Manage My Tournaments</h3>
            <Settings className="text-textSecondary animate-spin-slow" size={20} />
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            {isLoading ? (
              <p className="text-center text-textSecondary py-10">Loading...</p>
            ) : myTournaments.length === 0 ? (
              <div className="text-center py-10">
                <Trophy size={48} className="mx-auto text-white/10 mb-4" />
                <p className="text-textSecondary text-sm">You haven't created any tournaments yet.</p>
              </div>
            ) : (
              myTournaments.map(t => (
                <div key={t._id} className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-white">{t.title}</h4>
                      <p className="text-xs text-textSecondary flex items-center gap-1 mt-1">
                        <MapPin size={10} /> {t.venue}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-primary/20 text-primary text-[10px] font-bold rounded-full uppercase">
                      {t.format}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleManageTeams(t)}
                      className="flex-1 py-2 bg-secondary/10 hover:bg-secondary/20 text-secondary text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Users size={14} /> Manage Teams
                    </button>
                    <button 
                      onClick={() => handleGenerateFixtures(t._id)}
                      className="flex-1 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Activity size={14} /> Generate Fixtures
                    </button>
                    <button 
                      onClick={() => handleOpenLiveControl(t)}
                      className="flex-1 py-2 bg-success/10 hover:bg-success/20 text-success text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Play size={14} fill="currentColor" /> Live Control
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl"
            >
              <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-textSecondary hover:text-white">
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Trophy className="text-primary" /> Create Tournament
              </h2>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-1">Tournament Title</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full glass-input" placeholder="e.g. Summer Cup 2026" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-1">Sport</label>
                    <select value={formData.sportType} onChange={e => setFormData({...formData, sportType: e.target.value})} className="w-full glass-input bg-[#0f172a]">
                      <option>Football</option><option>Basketball</option><option>Cricket</option><option>Tennis</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-1">Format</label>
                    <select value={formData.format} onChange={e => setFormData({...formData, format: e.target.value})} className="w-full glass-input bg-[#0f172a]">
                      <option value="Knockout">Knockout</option>
                      <option value="League">League (Round Robin)</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-1">Venue</label>
                  <input required type="text" value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} className="w-full glass-input" placeholder="e.g. City Main Stadium" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-1">Start Date</label>
                    <input required type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full glass-input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-1">End Date</label>
                    <input required type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full glass-input" />
                  </div>
                </div>
                <button type="submit" className="w-full btn-primary py-3 mt-4 text-lg">Create Tournament</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manage Teams Modal */}
      <AnimatePresence>
        {showTeamsModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-2xl p-6 relative shadow-2xl max-h-[80vh] flex flex-col"
            >
              <button onClick={() => setShowTeamsModal(false)} className="absolute top-4 right-4 text-textSecondary hover:text-white">
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Users className="text-secondary" /> Manage Teams
              </h2>
              <p className="text-textSecondary text-sm mb-6">Tournament: {selectedTournament?.title}</p>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                {isLoadingTeams ? (
                  <p className="text-center text-textSecondary py-10">Loading teams...</p>
                ) : tournamentTeams.length === 0 ? (
                  <p className="text-center text-textSecondary py-10">No teams registered yet.</p>
                ) : (
                  tournamentTeams.map(team => (
                    <div key={team._id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                      <div>
                        <h4 className="font-bold text-white text-lg">{team.teamName}</h4>
                        <p className="text-xs text-textSecondary flex items-center gap-1 mt-1">
                          Captain: {team.captain?.name} • {team.players?.length || 0} Players
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${
                          team.status === 'Approved' ? 'bg-success/20 text-success' :
                          team.status === 'Rejected' ? 'bg-danger/20 text-danger' :
                          'bg-warning/20 text-warning'
                        }`}>
                          {team.status}
                        </span>
                        
                        {team.status === 'Pending' && (
                          <div className="flex gap-2 ml-4 border-l border-white/10 pl-4">
                            <button 
                              onClick={() => handleUpdateTeamStatus(team._id, 'Approved')}
                              className="p-2 bg-success/10 hover:bg-success/20 text-success rounded-lg transition-colors"
                              title="Accept"
                            >
                              <Check size={16} />
                            </button>
                            <button 
                              onClick={() => handleUpdateTeamStatus(team._id, 'Rejected')}
                              className="p-2 bg-danger/10 hover:bg-danger/20 text-danger rounded-lg transition-colors"
                              title="Reject"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixtures Modal */}
      <AnimatePresence>
        {showFixturesModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-2xl p-6 relative shadow-2xl max-h-[80vh] flex flex-col"
            >
              <button onClick={() => setShowFixturesModal(false)} className="absolute top-4 right-4 text-textSecondary hover:text-white">
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Activity className="text-primary" /> Generated Fixtures
              </h2>
              <p className="text-textSecondary text-sm mb-6">Successfully generated {generatedFixtures.length} matches.</p>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                {generatedFixtures.length === 0 ? (
                  <p className="text-center text-textSecondary py-10">No fixtures generated.</p>
                ) : (
                  generatedFixtures.map((match, i) => (
                    <div key={match._id} className="flex flex-col gap-2 p-4 bg-white/5 rounded-xl border border-white/5">
                      <div className="flex justify-between items-center text-xs text-textSecondary">
                        <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(match.schedule).toLocaleDateString()}</span>
                        <span className="px-2 py-0.5 bg-primary/20 text-primary rounded-full font-bold">{match.round}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex-1 text-center font-bold text-lg">{match.teamA?.team?.teamName || 'TBD'}</div>
                        <div className="px-4 text-textSecondary font-black text-xl">VS</div>
                        <div className="flex-1 text-center font-bold text-lg">{match.teamB?.team?.teamName || 'TBD'}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Control Modal */}
      <AnimatePresence>
        {showLiveControlModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-3xl p-6 relative shadow-2xl max-h-[85vh] flex flex-col"
            >
              <button onClick={() => setShowLiveControlModal(false)} className="absolute top-4 right-4 text-textSecondary hover:text-white">
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Play className="text-success" fill="currentColor" /> Live Match Control
              </h2>
              <p className="text-textSecondary text-sm mb-6">Manage scores and end matches for: {selectedTournament?.title}</p>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                {isLoadingMatches ? (
                  <p className="text-center text-textSecondary py-10">Loading matches...</p>
                ) : tournamentMatches.length === 0 ? (
                  <p className="text-center text-textSecondary py-10">No matches found.</p>
                ) : (
                  tournamentMatches.map((match) => (
                    <div key={match._id} className="flex flex-col gap-4 p-5 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex justify-between items-center text-xs text-textSecondary border-b border-white/5 pb-2">
                        <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(match.schedule).toLocaleDateString()}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-white">{match.round}</span>
                          <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            match.status === 'Completed' ? 'bg-success/20 text-success' :
                            match.status === 'Live' ? 'bg-danger/20 text-danger animate-pulse' :
                            'bg-primary/20 text-primary'
                          }`}>
                            {match.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2 gap-4">
                        {/* Team A */}
                        <div className="flex-1 flex flex-col items-center gap-2">
                          <div className="text-center font-bold text-lg text-white">{match.teamA?.team?.teamName || 'TBD'}</div>
                          {match.status !== 'Completed' && (
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleUpdateMatch(match._id, { scoreA: Math.max(0, match.teamA.score - 1) })} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                                <Minus size={14} />
                              </button>
                              <span className="text-2xl font-black w-8 text-center">{match.teamA.score}</span>
                              <button onClick={() => handleUpdateMatch(match._id, { scoreA: match.teamA.score + 1 })} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                                <Plus size={14} />
                              </button>
                            </div>
                          )}
                          {match.status === 'Completed' && <span className="text-3xl font-black text-white/50">{match.teamA.score}</span>}
                        </div>
                        
                        <div className="px-4 text-textSecondary font-black text-xl">VS</div>
                        
                        {/* Team B */}
                        <div className="flex-1 flex flex-col items-center gap-2">
                          <div className="text-center font-bold text-lg text-white">{match.teamB?.team?.teamName || 'TBD'}</div>
                          {match.status !== 'Completed' && (
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleUpdateMatch(match._id, { scoreB: Math.max(0, match.teamB.score - 1) })} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                                <Minus size={14} />
                              </button>
                              <span className="text-2xl font-black w-8 text-center">{match.teamB.score}</span>
                              <button onClick={() => handleUpdateMatch(match._id, { scoreB: match.teamB.score + 1 })} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                                <Plus size={14} />
                              </button>
                            </div>
                          )}
                          {match.status === 'Completed' && <span className="text-3xl font-black text-white/50">{match.teamB.score}</span>}
                        </div>
                      </div>

                      {match.status !== 'Completed' && match.teamA?.team && match.teamB?.team && (
                        <div className="flex justify-center gap-3 pt-4 border-t border-white/5">
                          {match.status !== 'Live' && (
                            <button 
                              onClick={() => handleUpdateMatch(match._id, { status: 'Live' })}
                              className="px-6 py-2 bg-danger/10 text-danger hover:bg-danger/20 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
                            >
                              <Play size={16} fill="currentColor" /> Go Live
                            </button>
                          )}
                          <button 
                            onClick={() => {
                              if(window.confirm('Are you sure you want to end this match? This will declare the winner automatically and may generate the next round.')) {
                                handleUpdateMatch(match._id, { status: 'Completed' });
                              }
                            }}
                            className="px-6 py-2 bg-success/10 text-success hover:bg-success/20 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
                          >
                            <Square size={16} fill="currentColor" /> End Match
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
