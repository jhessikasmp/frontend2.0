
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Digite o nome do usuário');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/users`);
      const data = await response.json();
      if (data.success) {
        const user = data.data.find((u: any) => u.name.trim().toLowerCase() === name.trim().toLowerCase());
        if (user) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          navigate('/dashboard');
        } else {
          setError('Usuário não encontrado');
        }
      } else {
        setError('Erro ao buscar usuários');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Fazer Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Digite seu nome de usuário para continuar
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nome do usuário
            </label>
            <div className="mt-1">
              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Digite seu nome"
                minLength={2}
                maxLength={50}
              />
            </div>
          </div>
          {error && <div className="text-red-600 text-sm text-center">{error}</div>}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Entrando...
                </div>
              ) : (
                'Entrar'
              )}
            </button>
          </div>
        </form>
        <div className="flex items-center justify-between">
          <div></div>
          <Link
            to="/register"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Não tem usuário? Registre-se
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
