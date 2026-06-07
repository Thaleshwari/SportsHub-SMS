import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTournaments } from '../redux/slices/tournamentSlice';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Trophy, Medal, ArrowUp, ArrowDown, Search } from 'lucide-react';

const Leaderboard = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();
  const { tournaments } = useSelector((state) => state.tournament);
  const [selectedTournament, setSelectedTournament] = useState(null);

  useEffect(() => {
    dispatch(fetchTournaments());
  }, [dispatch]);

  useEffect(() => {
    if (tournaments.length > 0 && !selectedTournament) {
      setSelectedTournament(tournaments[0]);
    }
  }, [tournaments]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedTournament) return;
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/tournaments/${selectedTournament._id}/leaderboard`);
        setTeams(res.data);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [selectedTournament]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Leaderboards</h1>
          <p className="text-textSecondary">Track team performance and rankings.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" size={16} />
            <input type="text" placeholder="Search team..." className="glass-input pl-10 py-2 text-sm" />
          </div>
          <select 
            value={selectedTournament?._id || ''} 
            onChange={(e) => setSelectedTournament(tournaments.find(t => t._id === e.target.value))}
            className="glass-input py-2 text-sm bg-background"
          >
            {tournaments.map(t => (
              <option key={t._id} value={t._id}>{t.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end mb-12 px-4">
        {/* 2nd Place */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 text-center order-2 md:order-1 h-64 flex flex-col justify-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-textSecondary/30" />
          <div className="w-16 h-16 rounded-full bg-white/5 border-2 border-textSecondary/50 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold">2</span>
          </div>
          <h3 className="font-bold text-lg mb-1">{teams[1]?.name}</h3>
          <p className="text-primary font-bold">{teams[1]?.pts} PTS</p>
          <Medal className="absolute -bottom-4 -right-4 text-textSecondary opacity-10" size={100} />
        </motion.div>

        {/* 1st Place */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 text-center order-1 md:order-2 h-80 flex flex-col justify-center border-primary/30 relative overflow-hidden neon-glow"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary" />
          <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mx-auto mb-4">
            <Trophy className="text-primary" size={40} />
          </div>
          <h3 className="font-black text-2xl mb-1">{teams[0]?.name}</h3>
          <p className="text-primary text-xl font-bold">{teams[0]?.pts} PTS</p>
          <Trophy className="absolute -bottom-6 -right-6 text-primary opacity-10" size={120} />
        </motion.div>

        {/* 3rd Place */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 text-center order-3 h-56 flex flex-col justify-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-amber-700/30" />
          <div className="w-14 h-14 rounded-full bg-white/5 border-2 border-amber-700/50 flex items-center justify-center mx-auto mb-4">
            <span className="text-xl font-bold">3</span>
          </div>
          <h3 className="font-bold mb-1">{teams[2]?.name}</h3>
          <p className="text-primary font-bold">{teams[2]?.pts} PTS</p>
          <Medal className="absolute -bottom-4 -right-4 text-amber-700 opacity-10" size={80} />
        </motion.div>
      </div>

      {/* Full Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-textSecondary text-xs uppercase tracking-wider font-bold">
              <th className="px-6 py-4">Pos</th>
              <th className="px-6 py-4">Team</th>
              <th className="px-6 py-4">P</th>
              <th className="px-6 py-4">W</th>
              <th className="px-6 py-4">D</th>
              <th className="px-6 py-4">L</th>
              <th className="px-6 py-4">GF</th>
              <th className="px-6 py-4">GA</th>
              <th className="px-6 py-4">GD</th>
              <th className="px-6 py-4">Pts</th>
              <th className="px-6 py-4 text-center">Form</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {teams.map((team, index) => (
              <tr key={index} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4 font-bold text-textSecondary group-hover:text-white transition-colors">{index + 1}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-white/5 border border-white/10" />
                    <span className="font-semibold">{team.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">{team.played}</td>
                <td className="px-6 py-4 text-success font-medium">{team.won}</td>
                <td className="px-6 py-4 text-textSecondary">{team.drawn}</td>
                <td className="px-6 py-4 text-danger font-medium">{team.lost}</td>
                <td className="px-6 py-4">{team.gf}</td>
                <td className="px-6 py-4">{team.ga}</td>
                <td className="px-6 py-4 font-medium">{team.gf - team.ga}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-primary/10 text-primary font-bold rounded-lg">{team.pts}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-2 h-2 bg-success rounded-full" />
                    <div className="w-2 h-2 bg-success rounded-full" />
                    <div className="w-2 h-2 bg-textSecondary/30 rounded-full" />
                    <div className="w-2 h-2 bg-success rounded-full" />
                    <div className="w-2 h-2 bg-danger rounded-full" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
