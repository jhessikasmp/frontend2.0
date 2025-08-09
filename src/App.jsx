import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ApiTest from './components/ApiTest';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Investments from './pages/Investments';
import EmergencyFund from './pages/EmergencyFund';
import TravelFund from './pages/TravelFund';
import CarReserve from './pages/CarReserve';
import Allowance from './pages/Allowance';
import Reports from './pages/Reports';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Rota raiz - redireciona para dashboard */}
            <Route 
              path="/" 
              element={<Navigate to="/dashboard" replace />} 
            />
            
            {/* Rotas públicas (sem proteção) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/api-test" element={<ApiTest />} />
            
            {/* Rotas principais (sem proteção) */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/investments" element={<Investments />} />
            <Route path="/emergency-fund" element={<EmergencyFund />} />
            <Route path="/travel-fund" element={<TravelFund />} />
            <Route path="/car-reserve" element={<CarReserve />} />
            <Route path="/allowance" element={<Allowance />} />
            <Route path="/reports" element={<Reports />} />
            
            {/* Rota 404 - redireciona para dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
