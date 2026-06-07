import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tournaments from './pages/Tournaments';
import LiveCenter from './pages/LiveCenter';
import Leaderboard from './pages/Leaderboard';
import Teams from './pages/Teams';
import Fixtures from './pages/Fixtures';
import Layout from './layouts/Layout';

function App() {
  const { user } = useSelector((state) => state.auth);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        
        <Route path="/" element={user ? <Layout /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard />} />
          <Route path="tournaments" element={<Tournaments />} />
          <Route path="teams" element={<Teams />} />
          <Route path="fixtures" element={<Fixtures />} />
          <Route path="live" element={<LiveCenter />} />
          <Route path="leaderboard" element={<Leaderboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
