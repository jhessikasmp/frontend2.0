import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, CheckCircle, AlertCircle } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ username: '' });
  const [validationErrors, setValidationErrors] = useState({});
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('handleChange:', name, value);
    setFormData({ ...formData, [name]: value });
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    console.log('validateForm input:', formData.username);
    if (!formData.username.trim()) {
      errors.username = 'Nome de usuário é obrigatório';
    } else if (formData.username.length < 3) {
      errors.username = 'Nome de usuário deve ter pelo menos 3 caracteres';
    } else if (formData.username.length > 20) {
      errors.username = 'Nome de usuário deve ter no máximo 20 caracteres';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'Nome de usuário só pode conter letras, números e underscore';
    }
    console.log('validateForm errors:', errors);
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('handleSubmit start');
    if (!validateForm()) {
      console.log('handleSubmit validation failed');
      return;
    }

    console.log('handleSubmit calling register with name=', formData.username);
    const result = await register({ name: formData.username });
    console.log('handleSubmit register result:', result);

    if (result.success) {
      console.log('handleSubmit success, navigate to dashboard');
      navigate('/dashboard');
    } else {
      console.log('handleSubmit failure, error:', result.error);
      alert(`Erro no registro: ${result.error}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="card">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-green-600 rounded-full flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
              JS FinanceApp
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Crie sua conta para gerenciar suas finanças
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Nome de usuário
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className={`input-field pl-10 ${
                    validationErrors.username
                      ? 'border-red-300 dark:border-red-600 focus:ring-red-500'
                      : formData.username && !validationErrors.username
                      ? 'border-green-300 dark:border-green-600 focus:ring-green-500'
                      : ''
                  }`}
                  placeholder="Escolha um nome de usuário"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={loading}
                />
                {formData.username && !validationErrors.username && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                )}
              </div>
              {validationErrors.username && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {validationErrors.username}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Use apenas letras, números e underscore. Entre 3-20 caracteres.
              </p>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || Object.keys(validationErrors).length > 0}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5 mr-2" />
                    Criar conta
                  </>
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Já tem uma conta?{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
                >
                  Faça login aqui
                </Link>
              </p>
            </div>
          </form>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            O que você pode fazer:
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Controlar despesas e investimentos
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Gerenciar fundos de emergência e viagem
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Visualizar relatórios anuais detalhados
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Acompanhar seu progresso financeiro
            </li>
          </ul>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Sistema Financeiro Pessoal - Simples, seguro e eficiente
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
