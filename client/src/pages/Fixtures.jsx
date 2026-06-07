import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTournaments } from '../redux/slices/tournamentSlice';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Trophy, ChevronDown, MapPin, Clock } from 'lucide-react';

const FixtureCard = ({ match }) => {
  const scheduleDate = new Date(match.schedule);
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -5 }}
      className="glass-card p-6 border-t-4 border-t-secondary hover:border-t-primary transition-colors duration-300"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-secondary/20 text-secondary text-xs font-bold rounded-full tracking-wider uppercase">
            {match.round}
          </span>
          {match.status === 'Live' && (
            <span className="px-2 py-1 bg-danger/20 text-danger text-[10px] font-bold rounded-full tracking-wider uppercase animate-pulse flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-danger rounded-full" /> Live
            </span>
          )}
          {match.status === 'Completed' && (
            <span className="px-2 py-1 bg-success/20 text-success text-[10px] font-bold rounded-full tracking-wider uppercase">
              Final
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-xs text-textSecondary font-medium">
          <div className="flex items-center gap-1.5"><Calendar size={14}/> {scheduleDate.toLocaleDateString()}</div>
          <div className="flex items-center gap-1.5"><Clock size={14}/> {scheduleDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex-1 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-2 mb-3">
            <span className="text-xl font-bold">{match.teamA?.team?.teamName?.charAt(0) || '?'}</span>
          </div>
          <h3 className="font-bold text-white leading-tight">{match.teamA?.team?.teamName || 'TBD'}</h3>
        </div>
        
        <div className="flex flex-col items-center justify-center px-4">
          {match.status === 'Completed' || match.status === 'Live' ? (
            <div className="text-3xl font-black text-white flex items-center gap-3">
              <span className={match.teamA?.score > match.teamB?.score && match.status === 'Completed' ? 'text-success' : ''}>
                {match.teamA?.score || 0}
              </span>
              <span className="text-white/20 text-xl">-</span>
              <span className={match.teamB?.score > match.teamA?.score && match.status === 'Completed' ? 'text-success' : ''}>
                {match.teamB?.score || 0}
              </span>
            </div>
          ) : (
            <div className="text-2xl font-black text-white/40 italic">VS</div>
          )}
        </div>

        <div className="flex-1 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-2 mb-3">
            <span className="text-xl font-bold">{match.teamB?.team?.teamName?.charAt(0) || '?'}</span>
          </div>
          <h3 className="font-bold text-white leading-tight">{match.teamB?.team?.teamName || 'TBD'}</h3>
        </div>
      </div>

      <div className="pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-sm text-textSecondary">
        <MapPin size={16} className="text-primary" /> {match.venue}
      </div>
    </motion.div>
  );
};

const Fixtures = () => {
  const dispatch = useDispatch();
  const { tournaments, isLoading: isLoadingTournaments } = useSelector((state) => state.tournament);
  
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [fixtures, setFixtures] = useState([]);
  const [isLoadingFixtures, setIsLoadingFixtures] = useState(false);
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
    const fetchFixtures = async () => {
      if (!selectedTournament) return;
      setIsLoadingFixtures(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/matches/tournament/${selectedTournament._id}`);
        // Sort by date ascending
        const sorted = res.data.sort((a, b) => new Date(a.schedule) - new Date(b.schedule));
        setFixtures(sorted);
      } catch (err) {
        console.error('Failed to fetch fixtures:', err);
      } finally {
        setIsLoadingFixtures(false);
      }
    };

    fetchFixtures();
  }, [selectedTournament]);

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Calendar className="text-secondary" size={32} /> Match Fixtures
          </h1>
          <p className="text-textSecondary">View scheduled matches and upcoming games.</p>
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
                      selectedTournament?._id === t._id ? 'bg-secondary/20 text-secondary font-bold' : 'hover:bg-white/5 text-textSecondary hover:text-white'
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

      {isLoadingTournaments || isLoadingFixtures ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 glass-card animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {fixtures.length === 0 ? (
            <div className="text-center py-20 glass-card">
              <Calendar size={64} className="mx-auto text-white/10 mb-4" />
              <h3 className="text-xl font-bold mb-2">No fixtures scheduled</h3>
              <p className="text-textSecondary">Matches haven't been generated for this tournament yet.</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {fixtures.map(match => (
                  <FixtureCard key={match._id} match={match} />
                ))}
              </div>
            </AnimatePresence>
          )}
        </>
      )}
    </div>
  );
};

export default Fixtures;
