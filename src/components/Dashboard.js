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
    <div className="w-full max-w-[1600px] mx-auto px-4 py-4">
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-gray-800">Dashboard de Pagamentos</h1>
        <p className="text-sm text-gray-600">Acompanhamento de pagamentos e processamentos</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Filtros */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-medium mb-4">Filtros</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
                <select
                  value={periodoTempo}
                  onChange={(e) => setPeriodoTempo(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="diario">Hoje</option>
                  <option value="7dias">Últimos 7 dias</option>
                  <option value="30dias">Últimos 30 dias</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Pagamento</label>
                <select
                  value={tipoPagamento}
                  onChange={(e) => setTipoPagamento(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="todos">Todos</option>
                  <option value="pix">PIX</option>
                  <option value="credit">Cartão de Crédito</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1">
          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Valor Total (Pago)</p>
              <p className="text-xl font-semibold mt-1">R$ {estatisticas.valorTotal.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Total de Pedidos</p>
              <p className="text-xl font-semibold mt-1">{dados.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Pedidos Processados</p>
              <p className="text-xl font-semibold mt-1">{estatisticas.totalProcessado}</p>
            </div>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-medium mb-4">Distribuição de Status</h3>
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

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-medium mb-4">Métodos de Pagamento</h3>
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
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-medium mb-4">Análise DMM - Pedidos por Dia da Semana</h3>
            <div className="h-64 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analisarPedidosPorDiaSemana()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" name="Total de Pedidos" fill="#0088FE" />
                  <Bar dataKey="pendentes" name="Pedidos Pendentes" fill="#FF8042" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Tabela DMM */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dia da Semana
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pendentes
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Taxa de Pendência
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {analisarPedidosPorDiaSemana().map((dia, index) => (
                    <tr key={dia.nome} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-2 text-sm text-gray-900">{dia.nome}</td>
                      <td className="px-4 py-2 text-sm text-right text-gray-900">{dia.total}</td>
                      <td className="px-4 py-2 text-sm text-right text-gray-900">{dia.pendentes}</td>
                      <td className="px-4 py-2 text-sm text-right text-gray-900">{dia.taxaPendencia}%</td>
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
