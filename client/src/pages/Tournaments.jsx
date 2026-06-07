import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTournaments, reset } from '../redux/slices/tournamentSlice';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Search, Filter, Calendar, Users, ChevronRight, X, Plus, Shield, MapPin } from 'lucide-react';

const TournamentCard = ({ tournament, onRegisterClick, onViewDetails }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    whileHover={{ y: -10 }}
    className="glass-card overflow-hidden group cursor-pointer flex flex-col"
    onClick={() => onViewDetails(tournament)}
  >
    <div className="relative h-48 overflow-hidden">
      <img 
        src={tournament.banner || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80'} 
        alt={tournament.title} 
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      <div className="absolute top-4 right-4 px-3 py-1 bg-primary/20 backdrop-blur-md border border-white/10 rounded-full text-xs font-bold text-primary">
        {tournament.sportType}
      </div>
      <div className="absolute bottom-4 left-4">
        <h3 className="text-xl font-bold text-white mb-1">{tournament.title}</h3>
        <p className="text-xs text-textSecondary flex items-center gap-1">
          <Calendar size={12} /> {new Date(tournament.startDate).toLocaleDateString()}
        </p>
      </div>
    </div>
    <div className="p-6 flex-1 flex flex-col">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-textSecondary uppercase tracking-wider font-bold">Format</span>
          <span className="text-sm font-medium">{tournament.format}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-textSecondary uppercase tracking-wider font-bold">Venue</span>
          <span className="text-sm font-medium truncate">{tournament.venue}</span>
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
        <div className="flex -space-x-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-white/10" />
          ))}
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onRegisterClick(tournament); }}
          className="btn-primary py-1.5 px-4 text-sm flex items-center gap-2"
        >
          <Shield size={16} /> Register Team
        </button>
      </div>
    </div>
  </motion.div>
);

const Tournaments = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { tournaments, isLoading } = useSelector((state) => state.tournament);
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [teamName, setTeamName] = useState('');
  const [players, setPlayers] = useState([{ name: '', jerseyNumber: '', position: '' }]);

  // Details Modal State
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsTournament, setDetailsTournament] = useState(null);
  const [approvedTeams, setApprovedTeams] = useState([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);

  useEffect(() => {
    dispatch(fetchTournaments());
    return () => dispatch(reset());
  }, [dispatch]);

  const filteredTournaments = tournaments.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.sportType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRegisterClick = (tournament) => {
    setSelectedTournament(tournament);
    setTeamName('');
    setPlayers([{ name: '', jerseyNumber: '', position: '' }]);
    setShowModal(true);
  };

  const handleViewDetails = async (tournament) => {
    setDetailsTournament(tournament);
    setShowDetailsModal(true);
    setIsLoadingTeams(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/teams/tournament/${tournament._id}`);
      setApprovedTeams(res.data.filter(team => team.status === 'Approved'));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingTeams(false);
    }
  };

  const handleAddPlayer = () => {
    setPlayers([...players, { name: '', jerseyNumber: '', position: '' }]);
  };

  const handlePlayerChange = (index, field, value) => {
    const newPlayers = [...players];
    newPlayers[index][field] = value;
    setPlayers(newPlayers);
  };

  const handleRemovePlayer = (index) => {
    const newPlayers = players.filter((_, i) => i !== index);
    setPlayers(newPlayers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/teams', {
        teamName,
        tournament: selectedTournament._id,
        players
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      alert('Team registered successfully! Awaiting Organizer approval.');
      setShowModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Error registering team');
    }
  };

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Tournaments</h1>
          <p className="text-textSecondary">Discover competitions and register your team.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" size={20} />
          <input 
            type="text" 
            placeholder="Search tournaments by name, sport, or venue..." 
            className="w-full glass-input pl-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 glass-card hover:bg-white/10 transition-colors">
          <Filter size={20} />
          <span>Filters</span>
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-[380px] glass-card animate-pulse" />
          ))}
        </div>
      ) : (
        <AnimatePresence>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map(tournament => (
              <TournamentCard 
                key={tournament._id} 
                tournament={tournament} 
                onRegisterClick={handleRegisterClick} 
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      {!isLoading && filteredTournaments.length === 0 && (
        <div className="text-center py-20 glass-card">
          <Trophy size={64} className="mx-auto text-white/10 mb-4" />
          <h3 className="text-xl font-bold mb-2">No tournaments found</h3>
          <p className="text-textSecondary">Try adjusting your search or check back later.</p>
        </div>
      )}

      {/* Registration Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto custom-scrollbar"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-2xl p-6 relative shadow-2xl my-8"
            >
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-textSecondary hover:text-white">
                <X size={24} />
              </button>
              
              <div className="mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2 mb-1">
                  <Shield className="text-primary" /> Register Team
                </h2>
                <p className="text-textSecondary text-sm">Joining <span className="text-white font-bold">{selectedTournament?.title}</span></p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Team Info */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <label className="block text-sm font-medium text-textSecondary mb-2">Team Name</label>
                  <input 
                    required 
                    type="text" 
                    value={teamName} 
                    onChange={e => setTeamName(e.target.value)} 
                    className="w-full glass-input" 
                    placeholder="e.g. Red Dragons FC" 
                  />
                </div>

                {/* Players List */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg">Team Roster</h3>
                    <span className="text-xs text-textSecondary">{players.length} Players added</span>
                  </div>
                  
                  <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                    {players.map((player, index) => (
                      <div key={index} className="flex gap-3 items-center p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                          {index + 1}
                        </div>
                        <input 
                          required 
                          placeholder="Player Name" 
                          value={player.name}
                          onChange={(e) => handlePlayerChange(index, 'name', e.target.value)}
                          className="flex-1 glass-input py-1.5 px-3 text-sm" 
                        />
                        <input 
                          placeholder="Jersey #" 
                          type="number"
                          value={player.jerseyNumber}
                          onChange={(e) => handlePlayerChange(index, 'jerseyNumber', e.target.value)}
                          className="w-20 glass-input py-1.5 px-3 text-sm text-center" 
                        />
                        {players.length > 1 && (
                          <button type="button" onClick={() => handleRemovePlayer(index)} className="text-danger hover:bg-danger/20 p-1.5 rounded-lg transition-colors">
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button 
                    type="button" 
                    onClick={handleAddPlayer}
                    className="mt-3 w-full py-2 border border-dashed border-white/20 text-textSecondary hover:text-white hover:border-white/40 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Plus size={16} /> Add Another Player
                  </button>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 rounded-lg hover:bg-white/5 transition-colors font-medium">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary px-8 py-2">
                    Submit Registration
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tournament Details Modal */}
      <AnimatePresence>
        {showDetailsModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto custom-scrollbar"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-2xl p-6 relative shadow-2xl my-8 max-h-[80vh] flex flex-col"
            >
              <button onClick={() => setShowDetailsModal(false)} className="absolute top-4 right-4 text-textSecondary hover:text-white">
                <X size={24} />
              </button>
              
              <div className="mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2 mb-1">
                  <Trophy className="text-primary" /> {detailsTournament?.title}
                </h2>
                <p className="text-textSecondary text-sm">
                  {detailsTournament?.sportType} • {detailsTournament?.format} • {detailsTournament?.venue}
                </p>
              </div>

              <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Users size={20} className="text-secondary" /> Participating Teams
                </h3>
                <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-full font-bold">
                  {approvedTeams.length} Approved
                </span>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                {isLoadingTeams ? (
                  <p className="text-center text-textSecondary py-10">Loading teams...</p>
                ) : approvedTeams.length === 0 ? (
                  <div className="text-center py-10 bg-white/5 rounded-xl border border-white/5">
                    <Shield size={32} className="mx-auto text-white/10 mb-3" />
                    <p className="text-textSecondary text-sm">No teams have been approved yet.</p>
                  </div>
                ) : (
                  approvedTeams.map(team => (
                    <div key={team._id} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                        <Users size={20} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white text-lg">{team.teamName}</h4>
                        <p className="text-xs text-textSecondary mt-1">
                          Captain: {team.captain?.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">{team.players?.length || 0}</div>
                        <div className="text-[10px] text-textSecondary uppercase">Players</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="pt-6 mt-4 border-t border-white/10 flex justify-end">
                <button 
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleRegisterClick(detailsTournament);
                  }} 
                  className="btn-primary px-6 py-2 flex items-center gap-2"
                >
                  <Shield size={16} /> Register Your Team
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tournaments;
