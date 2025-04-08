import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';
import LoginPage from './pages/LoginPage';
import ManageUsers from './pages/ManageUsers';
import DashboardPage from './pages/ProductsPage';
import InvoicesPage from './pages/Invoices';
import Statistics from './pages/Statistics';
import { isTokenExpired } from './api/axiosClient';
import Modal from 'react-modal';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

Modal.setAppElement('#root');

// Separate component for token validation
function TokenValidator() {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const checkTokenValidity = () => {
      const token = localStorage.getItem('jwt_token');
      
      if (token && isTokenExpired(token)) {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('csrf');
        
        if (location.pathname !== '/login') {
          navigate('/login', { replace: true });
        }
      }
    };
    
    checkTokenValidity();
    const intervalId = setInterval(checkTokenValidity, 60000);
    return () => clearInterval(intervalId);
  }, [navigate, location.pathname]);
  
  return null;
}

function App() {
  return (
    <Router>
      <TokenValidator />
      <Routes>
        {/* Only accessible if NOT logged in */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Protected routes: Only accessible if logged in */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/manage-users" element={<ManageUsers />} />
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/statistics" element={<Statistics />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
