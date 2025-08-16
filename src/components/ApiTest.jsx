import React, { useState } from 'react';
import axios from 'axios';

const ApiTest = () => {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testBackendConnection = async () => {
    setLoading(true);
    setTestResult('Testando conexão...');
    
    try {
      // Testar conexão básica
      const response = await axios.get('http://localhost:5000/');
      setTestResult(`✅ Backend conectado: ${JSON.stringify(response.data)}`);
    } catch (error) {
      setTestResult(`❌ Erro de conexão: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testRegister = async () => {
    setLoading(true);
    setTestResult('Testando registro...');
    
    try {
      const userData = { username: `teste_${Date.now()}` };
      const response = await axios.post('http://localhost:5000/api/users/register', userData);
      setTestResult(`✅ Registro bem-sucedido: ${JSON.stringify(response.data)}`);
    } catch (error) {
      setTestResult(`❌ Erro no registro: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Debug API</h2>
      
      <div className="space-y-4">
        <button
          onClick={testBackendConnection}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          {loading ? 'Testando...' : 'Testar Conexão Backend'}
        </button>
        
        <button
          onClick={testRegister}
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
        >
          {loading ? 'Testando...' : 'Testar Registro'}
        </button>
        
        {testResult && (
          <div className="mt-4 p-3 bg-gray-100 rounded">
            <pre className="text-xs whitespace-pre-wrap">{testResult}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiTest;
