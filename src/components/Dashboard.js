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

const DIAS_SEMANA = {
  0: 'Domingo',
  1: 'Segunda',
  2: 'Terça',
  3: 'Quarta',
  4: 'Quinta',
  5: 'Sexta',
  6: 'Sábado'
};

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

  const processarDados = () => {
    let dadosFiltrados = [...dados];

    if (filtroData.de && filtroData.ate) {
      dadosFiltrados = dadosFiltrados.filter(item => {
        const dataItem = new Date(item.dataCriacao);
        return dataItem >= new Date(filtroData.de) && dataItem <= new Date(filtroData.ate);
      });
    }

    if (tipoPagamento !== 'todos') {
      dadosFiltrados = dadosFiltrados.filter(item => item.paymentType === tipoPagamento);
    }

    return dadosFiltrados;
  };

  const analisarPedidosPorDiaSemana = () => {
    const pedidosPorDia = dados.reduce((acc, item) => {
      const data = new Date(item.dataCriacao);
      const diaSemana = data.getDay();
      
      if (!acc[diaSemana]) {
        acc[diaSemana] = {
          total: 0,
          pendentes: 0,
          nome: DIAS_SEMANA[diaSemana]
        };
      }
      
      acc[diaSemana].total += 1;
      if (item.status === 'pending') {
        acc[diaSemana].pendentes += 1;
      }
      
      return acc;
    }, {});

    return Object.entries(pedidosPorDia)
      .map(([dia, dados]) => ({
        nome: dados.nome,
        total: dados.total,
        pendentes: dados.pendentes,
        taxaPendencia: dados.total ? ((dados.pendentes / dados.total) * 100).toFixed(1) : '0'
      }))
      .sort((a, b) => 
        Object.keys(DIAS_SEMANA).findIndex(k => DIAS_SEMANA[k] === a.nome) - 
        Object.keys(DIAS_SEMANA).findIndex(k => DIAS_SEMANA[k] === b.nome)
      );
  };

  const calcularEstatisticas = () => {
    const dadosFiltrados = processarDados();
    
    return {
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
  };

  const estatisticas = calcularEstatisticas();

  const dadosStatus = [
    { nome: 'Pago', valor: estatisticas.totalPago },
    { nome: 'Pendente', valor: estatisticas.totalPendente },
    { nome: 'Expirado', valor: estatisticas.totalExpirado }
  ];

  const CORES = ['#0088FE', '#00C49F', '#FFBB28'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard de Pagamentos</h1>
        <p className="mt-1 text-sm text-gray-600">Acompanhamento de pagamentos e processamentos</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Filtros */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Filtros</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Inicial
                </label>
                <input
                  type="date"
                  value={filtroData.de}
                  onChange={(e) => setFiltroData(prev => ({ ...prev, de: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Final
                </label>
                <input
                  type="date"
                  value={filtroData.ate}
                  onChange={(e) => setFiltroData(prev => ({ ...prev, ate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Pagamento
                </label>
                <select
                  value={tipoPagamento}
                  onChange={(e) => setTipoPagamento(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todos">Todos</option>
                  <option value="pix">PIX</option>
                  <option value="credit">Cartão de Crédito</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Período
                </label>
                <select
                  value={periodoTempo}
                  onChange={(e) => setPeriodoTempo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="diario">Hoje</option>
                  <option value="7dias">Últimos 7 dias</option>
                  <option value="30dias">Últimos 30 dias</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="col-span-12 lg:col-span-9">
          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Valor Total (Pago)</p>
                  <p className="mt-2 text-2xl font-semibold">
                    R$ {estatisticas.valorTotal.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Pedidos</p>
                  <p className="mt-2 text-2xl font-semibold">{dados.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pedidos Processados</p>
                  <p className="mt-2 text-2xl font-semibold">{estatisticas.totalProcessado}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Distribuição de Status</h3>
              <div className="h-64">
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

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Métodos de Pagamento</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { nome: 'PIX', valor: dados.filter(item => item.paymentType === 'pix').length },
                    { nome: 'Cartão de Crédito', valor: dados.filter(item => item.paymentType === 'credit').length }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nome" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="valor" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Análise DMM */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Análise DMM - Pedidos por Dia da Semana</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analisarPedidosPorDiaSemana()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" />
                  <YAxis />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 border rounded shadow-lg">
                            <p className="font-semibold">{label}</p>
                            <p className="text-blue-600">Total: {payload[0].value}</p>
                            <p className="text-red-600">Pendentes: {payload[1].value}</p>
                            <p className="text-gray-600">Taxa de Pendência: {payload[1].payload.taxaPendencia}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="total" name="Total de Pedidos" fill="#0088FE" />
                  <Bar dataKey="pendentes" name="Pedidos Pendentes" fill="#FF8042" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Tabela de Análise */}
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dia da Semana
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pendentes
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Taxa de Pendência
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analisarPedidosPorDiaSemana().map((dia, index) => (
                    <tr key={dia.nome} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {dia.nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                        {dia.total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                        {dia.pendentes}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                        {dia.taxaPendencia}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
