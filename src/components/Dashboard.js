import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, 
  PieChart, Pie, 
  XAxis, YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Calendar } from 'lucide-react';

const Dashboard = () => {
  const [dados, setDados] = useState([]);
  const [filtroData, setFiltroData] = useState({ de: '', ate: '' });
  const [tipoPagamento, setTipoPagamento] = useState('todos');
  const [periodoTempo, setPeriodoTempo] = useState('diario');

  useEffect(() => {
    const buscarDados = async () => {
      try {
        const resposta = await window.fs.readFile('paste-2.txt', { encoding: 'utf8' });
        const dadosProcessados = JSON.parse(resposta);
        setDados([dadosProcessados]);
      } catch (erro) {
        console.error('Erro ao buscar dados:', erro);
      }
    };

    buscarDados();
  }, []);

  // Função para calcular a data há X dias atrás
  const calcularDataAnterior = (dias) => {
    const data = new Date();
    data.setDate(data.getDate() - dias);
    return data;
  };

  const processarDados = () => {
    let dadosFiltrados = [...dados];

    // Aplicar filtro de período
    if (periodoTempo !== 'todos') {
      const dataAtual = new Date();
      let dataInicial;

      switch (periodoTempo) {
        case 'diario':
          dataInicial = new Date(dataAtual.setHours(0, 0, 0, 0));
          break;
        case '7dias':
          dataInicial = calcularDataAnterior(7);
          break;
        case '30dias':
          dataInicial = calcularDataAnterior(30);
          break;
        default:
          break;
      }

      if (dataInicial) {
        dadosFiltrados = dadosFiltrados.filter(item => {
          const dataItem = new Date(item.dataCriacao);
          return dataItem >= dataInicial;
        });
      }
    }

    // Aplicar filtro de tipo de pagamento
    if (tipoPagamento !== 'todos') {
      dadosFiltrados = dadosFiltrados.filter(item => item.paymentType === tipoPagamento);
    }

    return dadosFiltrados;
  };

  const calcularEstatisticas = () => {
    const dadosFiltrados = processarDados();
    
    const stats = {
      totalPago: dadosFiltrados.filter(item => item.status === 'paid').length,
      totalPendente: dadosFiltrados.filter(item => item.status === 'pending').length,
      totalExpirado: dadosFiltrados.filter(item => item.status === 'expired').length,
      totalProcessado: dadosFiltrados.filter(item => item.process === true).length,
      valorTotal: dadosFiltrados.reduce((acc, item) => {
        if (item.status === 'paid') {
          return acc + (item.orcamento?.[0]?.orc_valor_liquido || 0);
        }
        return acc;
      }, 0)
    };

    return stats;
  };

  const estatisticas = calcularEstatisticas();

  const dadosStatus = [
    { nome: 'Pago', valor: estatisticas.totalPago },
    { nome: 'Pendente', valor: estatisticas.totalPendente },
    { nome: 'Expirado', valor: estatisticas.totalExpirado }
  ];

  const CORES = ['#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Financeiro</h1>
          <p className="mt-2 text-gray-600">Acompanhamento de pagamentos e processamentos</p>
        </div>

        {/* Filtros e Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {/* Seção de Filtros */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Filtros</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Período de Análise
                </label>
                <select
                  value={periodoTempo}
                  onChange={(e) => setPeriodoTempo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="diario">Hoje</option>
                  <option value="7dias">Últimos 7 dias</option>
                  <option value="30dias">Últimos 30 dias</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Pagamento
                </label>
                <select
                  value={tipoPagamento}
                  onChange={(e) => setTipoPagamento(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="todos">Todos</option>
                  <option value="pix">PIX</option>
                  <option value="credit">Cartão de Crédito</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cards de Métricas */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card - Valor Total */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Valor Total (Pago)</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    R$ {estatisticas.valorTotal.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Card - Total de Pedidos */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{dados.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Card - Pedidos Processados */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pedidos Processados</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{estatisticas.totalProcessado}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Status */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Distribuição de Status</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="valor"
                    nameKey="nome"
                  >
                    {dadosStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico de Métodos de Pagamento */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Métodos de Pagamento</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={[
                    { nome: 'PIX', valor: dados.filter(item => item.paymentType === 'pix').length },
                    { nome: 'Cartão de Crédito', valor: dados.filter(item => item.paymentType === 'credit').length }
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="valor" fill="#6366F1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
