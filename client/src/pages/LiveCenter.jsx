import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Activity, Clock, Shield, ChevronRight } from 'lucide-react';

const socket = io('http://localhost:5000');

const LiveMatch = ({ match }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card p-6 border-l-4 border-l-primary"
  >
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2 px-3 py-1 bg-success/10 rounded-full">
        <div className="w-2 h-2 bg-success rounded-full animate-ping" />
        <span className="text-[10px] font-bold text-success uppercase tracking-wider">Live</span>
      </div>
      <div className="flex items-center gap-2 text-textSecondary text-xs">
        <Clock size={14} />
        <span>78' Second Half</span>
      </div>
    </div>

    <div className="flex items-center justify-around gap-8 mb-8">
      {/* Team A */}
      <div className="flex flex-col items-center gap-3 text-center w-1/3">
        <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-4">
          <Shield className="text-primary" size={40} />
        </div>
        <h3 className="font-bold text-lg">{match.teamA?.team?.teamName || 'Team A'}</h3>
      </div>

      {/* Score */}
      <div className="flex flex-col items-center">
        <div className="text-6xl font-black tracking-tighter flex items-center gap-4">
          <span className="text-white">{match.teamA?.score || 0}</span>
          <span className="text-white/20">:</span>
          <span className="text-white">{match.teamB?.score || 0}</span>
        </div>
        <span className="text-xs text-textSecondary font-medium mt-2">Premier League</span>
      </div>

      {/* Team B */}
      <div className="flex flex-col items-center gap-3 text-center w-1/3">
        <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-4">
          <Shield className="text-secondary" size={40} />
        </div>
        <h3 className="font-bold text-lg">{match.teamB?.team?.teamName || 'Team B'}</h3>
      </div>
    </div>

    <div className="space-y-3">
      {match.events?.slice(-3).reverse().map((event, i) => (
        <div key={i} className="flex items-center gap-3 text-sm p-3 bg-white/5 rounded-xl border border-white/5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Activity size={16} />
          </div>
          <p className="flex-1 text-textSecondary">
            <span className="text-white font-bold">{event.player}</span> {event.description}
          </p>
          <span className="text-xs text-textSecondary font-mono">{event.time}</span>
        </div>
      ))}
    </div>

    <button className="w-full mt-6 btn-primary py-3 flex items-center justify-center gap-2">
      View Match Center <ChevronRight size={20} />
    </button>
  </motion.div>
);

const LiveCenter = () => {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const fetchLiveMatches = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/matches/live');
        setMatches(res.data);
      } catch (err) {
        console.error('Failed to fetch live matches:', err);
      }
    };
    fetchLiveMatches();
    
    socket.on('score_updated', (updatedMatch) => {
      setMatches(prev => {
        if (updatedMatch.status !== 'Live') {
           return prev.filter(m => m._id !== updatedMatch._id);
        }
        const matchExists = prev.find(m => m._id === updatedMatch._id);
        if (matchExists) {
          return prev.map(m => m._id === updatedMatch._id ? updatedMatch : m);
        } else {
          return [...prev, updatedMatch];
        }
      });
    });

    return () => {
      socket.off('score_updated');
    };
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Live Match Center</h1>
          <p className="text-textSecondary">Real-time updates from ongoing matches.</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
          <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
          <span className="text-sm font-bold">4 Matches Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {matches.map(match => (
          <LiveMatch key={match._id} match={match} />
        ))}
      </div>

      {matches.length === 0 && (
        <div className="text-center py-20 glass-card">
          <Activity size={64} className="mx-auto text-white/10 mb-4" />
          <h3 className="text-xl font-bold mb-2">No live matches at the moment</h3>
          <p className="text-textSecondary">Check back later for upcoming fixtures.</p>
        </div>
      )}
    </div>
  );
};

export default LiveCenter;
