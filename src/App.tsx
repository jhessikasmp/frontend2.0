import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Despesas from './pages/Despesas';
import Investimento from './pages/Investimento';
import Emergencia from './pages/Emergencia';
import Viagens from './pages/Viagens';
import Carro from './pages/Carro';
import Mesada from './pages/Mesada';
import RelatorioAnual from './pages/RelatorioAnual';



import './styles/globals.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard/*" element={<Dashboard />}>
            <Route path="despesas" element={<Despesas />} />
            <Route path="investimento" element={<Investimento />} />
            <Route path="emergencia" element={<Emergencia />} />
            <Route path="viagens" element={<Viagens />} />
            <Route path="carro" element={<Carro />} />
            <Route path="mesada" element={<Mesada />} />
            <Route path="relatorio-anual" element={<RelatorioAnual />} />
          </Route>
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;