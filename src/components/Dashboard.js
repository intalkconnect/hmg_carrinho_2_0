import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, 
  PieChart, Pie, 
  LineChart, Line,
  XAxis, YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

const DashboardPagamentos = () => {
  const [dados, setDados] = useState([]);
  const [filtroData, setFiltroData] = useState({ de: '', ate: '' });
  const [tipoPagamento, setTipoPagamento] = useState('todos');
  const [periodoTempo, setPeriodoTempo] = useState('diario');

  useEffect(() => {
    const buscarDados = async () => {
      try {
        const resposta = await window.fs.readFile('paste-2.txt', { encoding: 'utf8' });
        const dadosProcessados = JSON.parse(resposta);
        setDados([dadosProcessados]); // Envolvendo em array pois é um objeto único
      } catch (erro) {
        console.error('Erro ao buscar dados:', erro);
      }
    };

    buscarDados();
  }, []);

  // Processar dados baseado nos filtros
  const processarDados = () => {
    let dadosFiltrados = [...dados];

    // Aplicar filtro de data
    if (filtroData.de && filtroData.ate) {
      dadosFiltrados = dadosFiltrados.filter(item => {
        const dataItem = new Date(item.dataCriacao);
        return dataItem >= new Date(filtroData.de) && dataItem <= new Date(filtroData.ate);
      });
    }

    // Aplicar filtro de tipo de pagamento
    if (tipoPagamento !== 'todos') {
      dadosFiltrados = dadosFiltrados.filter(item => item.paymentType === tipoPagamento);
    }

    return dadosFiltrados;
  };

  // Calcular estatísticas
  const calcularEstatisticas = () => {
    const dadosFiltrados = processarDados();
    
    const estatisticas = {
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

    return estatisticas;
  };

  const estatisticas = calcularEstatisticas();

  // Dados para o gráfico de pizza de status
  const dadosStatus = [
    { nome: 'Pago', valor: estatisticas.totalPago },
    { nome: 'Pendente', valor: estatisticas.totalPendente },
    { nome: 'Expirado', valor: estatisticas.totalExpirado }
  ];

  // Cores para o gráfico de pizza
  const CORES = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Controles de Filtro */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Período</label>
                <div className="flex space-x-2">
                  <div className="relative w-full">
                    <input
                      type="date"
                      value={filtroData.de}
                      onChange={(e) => setFiltroData(prev => ({ ...prev, de: e.target.value }))}
                      className="w-full p-2 border rounded"
                    />
                    <Calendar className="absolute right-2 top-2 h-4 w-4 text-gray-400" />
                  </div>
                  <div className="relative w-full">
                    <input
                      type="date"
                      value={filtroData.ate}
                      onChange={(e) => setFiltroData(prev => ({ ...prev, ate: e.target.value }))}
                      className="w-full p-2 border rounded"
                    />
                    <Calendar className="absolute right-2 top-2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Pagamento</label>
                <select
                  value={tipoPagamento}
                  onChange={(e) => setTipoPagamento(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="todos">Todos</option>
                  <option value="pix">PIX</option>
                  <option value="credit">Cartão de Crédito</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Período de Análise</label>
                <select
                  value={periodoTempo}
                  onChange={(e) => setPeriodoTempo(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="diario">Diário</option>
                  <option value="semanal">Semanal</option>
                  <option value="mensal">Mensal</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards de Resumo */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-2">Valor Total (Pago)</h3>
            <p className="text-2xl font-bold">R$ {estatisticas.valorTotal.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-2">Total de Pedidos</h3>
            <p className="text-2xl font-bold">{dados.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-2">Pedidos Processados</h3>
            <p className="text-2xl font-bold">{estatisticas.totalProcessado}</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico de Pizza - Distribuição de Status */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4">Distribuição de Status</h3>
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
          </CardContent>
        </Card>

        {/* Gráfico de Barras - Distribuição por Método de Pagamento */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4">Distribuição por Método de Pagamento</h3>
            <div className="h-80">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
