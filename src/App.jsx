import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
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
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <div className="App">
            <Routes>
            {/* Rota raiz - redireciona para dashboard se autenticado, senão para login */}
            <Route 
              path="/" 
              element={<Navigate to="/dashboard" replace />} 
            />
            
            {/* Rotas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/debug" element={<ApiTest />} />
            
            {/* Rotas protegidas */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/expenses"
              element={
                <ProtectedRoute>
                  <Expenses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/investments"
              element={
                <ProtectedRoute>
                  <Investments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/funds/emergencia"
              element={
                <ProtectedRoute>
                  <EmergencyFund />
                </ProtectedRoute>
              }
            />
            <Route
              path="/funds/viagem"
              element={
                <ProtectedRoute>
                  <TravelFund />
                </ProtectedRoute>
              }
            />
            <Route
              path="/funds/carro"
              element={
                <ProtectedRoute>
                  <CarReserve />
                </ProtectedRoute>
              }
            />
            <Route
              path="/funds/mesada"
              element={
                <ProtectedRoute>
                  <Allowance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />
            
            {/* Rota 404 - redireciona para dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
