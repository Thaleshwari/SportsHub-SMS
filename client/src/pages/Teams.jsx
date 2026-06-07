import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTournaments } from '../redux/slices/tournamentSlice';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shield, Trophy, ChevronDown, User } from 'lucide-react';

const TeamCard = ({ team }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    whileHover={{ y: -5 }}
    className="glass-card p-6 flex flex-col"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-3">
          <Shield className="text-primary" size={32} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">{team.teamName}</h3>
          <p className="text-sm text-textSecondary flex items-center gap-1 mt-1">
            <User size={14} /> Captain: {team.captain?.name || 'Unknown'}
          </p>
        </div>
      </div>
      <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${
        team.status === 'Approved' ? 'bg-success/20 text-success' :
        team.status === 'Rejected' ? 'bg-danger/20 text-danger' :
        'bg-warning/20 text-warning'
      }`}>
        {team.status}
      </span>
    </div>

    <div className="mt-4 pt-4 border-t border-white/5">
      <h4 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-3 flex items-center gap-2">
        <Users size={14} /> Roster ({team.players?.length || 0})
      </h4>
      <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
        {team.players?.map((player, idx) => (
          <div key={idx} className="flex items-center justify-between bg-white/5 p-2 rounded-lg text-sm">
            <span className="font-medium">{player.name}</span>
            {player.jerseyNumber && (
              <span className="text-xs text-textSecondary bg-white/10 px-2 py-0.5 rounded font-mono">
                #{player.jerseyNumber}
              </span>
            )}
          </div>
        ))}
        {(!team.players || team.players.length === 0) && (
          <p className="text-xs text-textSecondary italic">No players listed.</p>
        )}
      </div>
    </div>
  </motion.div>
);

const Teams = () => {
  const dispatch = useDispatch();
  const { tournaments, isLoading: isLoadingTournaments } = useSelector((state) => state.tournament);
  
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [teams, setTeams] = useState([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchTournaments());
  }, [dispatch]);

  useEffect(() => {
    if (tournaments.length > 0 && !selectedTournament) {
      setSelectedTournament(tournaments[0]);
    }
  }, [tournaments]);

  useEffect(() => {
    const fetchTeams = async () => {
      if (!selectedTournament) return;
      setIsLoadingTeams(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/teams/tournament/${selectedTournament._id}`);
        setTeams(res.data);
      } catch (err) {
        console.error('Failed to fetch teams:', err);
      } finally {
        setIsLoadingTeams(false);
      }
    };

    fetchTeams();
  }, [selectedTournament]);

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Users className="text-primary" size={32} /> Teams Directory
          </h1>
          <p className="text-textSecondary">Browse participating teams across all tournaments.</p>
        </div>

        {/* Tournament Selector */}
        <div className="relative w-full md:w-72 z-20">
          <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">
            Select Tournament
          </label>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full glass-card flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
          >
            <span className="font-medium truncate pr-4">
              {selectedTournament?.title || 'Select a tournament...'}
            </span>
            <ChevronDown size={18} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 glass-card max-h-60 overflow-y-auto custom-scrollbar flex flex-col p-1 shadow-2xl"
              >
                {tournaments.map(t => (
                  <button
                    key={t._id}
                    onClick={() => { setSelectedTournament(t); setIsDropdownOpen(false); }}
                    className={`text-left px-4 py-3 rounded-lg text-sm transition-colors ${
                      selectedTournament?._id === t._id ? 'bg-primary/20 text-primary font-bold' : 'hover:bg-white/5 text-textSecondary hover:text-white'
                    }`}
                  >
                    {t.title}
                  </button>
                ))}
                {tournaments.length === 0 && (
                  <div className="p-4 text-center text-sm text-textSecondary">No tournaments available.</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {isLoadingTournaments || isLoadingTeams ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 glass-card animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {teams.length === 0 ? (
            <div className="text-center py-20 glass-card">
              <Shield size={64} className="mx-auto text-white/10 mb-4" />
              <h3 className="text-xl font-bold mb-2">No teams registered</h3>
              <p className="text-textSecondary">There are no teams for the selected tournament.</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.map(team => (
                  <TeamCard key={team._id} team={team} />
                ))}
              </div>
            </AnimatePresence>
          )}
        </>
      )}
    </div>
  );
};

export default Teams;
