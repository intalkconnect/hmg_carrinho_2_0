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
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Container
} from '@mui/material';
import { CalendarToday } from '@mui/icons-material';

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
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 4 }}>
          Dashboard de Pagamentos
        </Typography>

        <Grid container spacing={3}>
          {/* Filtros */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Filtros
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Data Inicial"
                    type="date"
                    value={filtroData.de}
                    onChange={(e) => setFiltroData(prev => ({ ...prev, de: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />

                  <TextField
                    label="Data Final"
                    type="date"
                    value={filtroData.ate}
                    onChange={(e) => setFiltroData(prev => ({ ...prev, ate: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />

                  <FormControl fullWidth>
                    <InputLabel>Tipo de Pagamento</InputLabel>
                    <Select
                      value={tipoPagamento}
                      onChange={(e) => setTipoPagamento(e.target.value)}
                      label="Tipo de Pagamento"
                    >
                      <MenuItem value="todos">Todos</MenuItem>
                      <MenuItem value="pix">PIX</MenuItem>
                      <MenuItem value="credit">Cartão de Crédito</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Período</InputLabel>
                    <Select
                      value={periodoTempo}
                      onChange={(e) => setPeriodoTempo(e.target.value)}
                      label="Período"
                    >
                      <MenuItem value="diario">Diário</MenuItem>
                      <MenuItem value="semanal">Semanal</MenuItem>
                      <MenuItem value="mensal">Mensal</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Cards de Resumo */}
          <Grid item xs={12} md={9}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Valor Total (Pago)
                    </Typography>
                    <Typography variant="h5">
                      R$ {estatisticas.valorTotal.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Total de Pedidos
                    </Typography>
                    <Typography variant="h5">
                      {dados.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Pedidos Processados
                    </Typography>
                    <Typography variant="h5">
                      {estatisticas.totalProcessado}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Gráficos */}
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Distribuição de Status
                    </Typography>
                    <Box sx={{ height: 300 }}>
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
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Métodos de Pagamento
                    </Typography>
                    <Box sx={{ height: 300 }}>
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
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;
