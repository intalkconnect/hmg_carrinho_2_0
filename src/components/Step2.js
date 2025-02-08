import React, { useState } from 'react';
import {
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField,
  Button,
  MenuItem,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material';
import { consultarCEP } from '../services/api';

const locaisRetirada = [
  {
    id: 'Centro',
    nome: 'Centro',
    endereco: 'Av. Amazonas, nº 467 - 3º Andar, Centro, Belo Horizonte - Minas Gerais',
    horarios: {
      semana: '09:00 às 18:00',
      sabado: '09:00 às 13:00',
      feriados: 'Exceto Feriados',
    },
    coordenadas: { lat: -19.9196249, lng: -43.9414644 },
    loja: 'Lantana',
  },
  {
    id: 'Locker Mundo Verde',
    nome: 'Locker Mundo Verde',
    endereco: 'Rua Francisco Deslandes, nº 855 - Loja 01, Anchieta, Belo Horizonte - Minas Gerais',
    horarios: {
      semana: '09:00 às 19:00',
      sabado: '09:00 às 14:00',
      feriados: 'Exceto Feriados',
    },
    coordenadas: { lat: -19.9509969, lng: -43.9302836 },
    loja: 'Mundo Verde',
  },
  {
    id: 'Santa Efigênia',
    nome: 'Santa Efigênia',
    endereco: 'Rua Domingos Vieira, nº 319 - Loja 01, Santa Efigênia, Belo Horizonte - Minas Gerais',
    horarios: {
      semana: '08:00 às 18:00',
      sabado: '08:00 às 12:00',
      feriados: 'Exceto Feriados',
    },
    coordenadas: { lat: -19.922898, lng: -43.9332712 },
    loja: 'Lantana',
  },
];

const Step2 = ({ formData, handleInputChange, nextStep }) => {
  const [tipoEntrega, setTipoEntrega] = useState(formData.tipoEntrega || '');
  const [selectedLocal, setSelectedLocal] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);
  const [frete, setFrete] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [metodosFrete, setMetodosFrete] = useState({ pac: null, sedex: null });
  const [disabledFields, setDisabledFields] = useState({
    endereco: true,
    bairro: true,
    cidade: true,
    estado: true,
  });
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
    const clearedFields = {
      cep: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
    };
    Object.keys(clearedFields).forEach((key) => {
      handleInputChange({ target: { name: key, value: clearedFields[key] } });
    });
  };

  const handleOptionChange = (e) => {
    const value = e.target.value;
    setTipoEntrega(value);
    handleInputChange(e);

    if (value === 'retirada') {
      setFrete(0);
      handleInputChange({ target: { name: 'frete', value: '0.00' } });
      setErrors((prevErrors) => ({ ...prevErrors, localRetirada: null }));
      const clearedFields = {
        cep: '',
        endereco: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
      };
      Object.keys(clearedFields).forEach((key) => {
        handleInputChange({ target: { name: key, value: clearedFields[key] } });
      });
      setDisabledFields({
        endereco: true,
        bairro: true,
        cidade: true,
        estado: true,
      });
    }
    if (value === 'entrega') {
      setSelectedLocal('');
    }
  };

  const handleLocalChange = (event) => {
    const selectedId = event.target.value;
    setSelectedLocal(selectedId);
    handleInputChange({ target: { name: 'localRetirada', value: selectedId } });

    if (errors.localRetirada) {
      setErrors((prevErrors) => ({ ...prevErrors, localRetirada: null }));
    }
  };

  const handleCepBlur = async () => {
    if (!formData.cep || formData.cep.length !== 8) {
      setSnackbar({ open: true, message: 'CEP inválido. Certifique-se de que possui 8 dígitos.', severity: 'error' });
      return;
    }

    let isCancelled = false;

    try {
      setLoadingCep(true);

      const data = await consultarCEP(formData.cep);

      if (isCancelled) return;

      handleInputChange({ target: { name: 'endereco', value: data.logradouro || '' } });
      handleInputChange({ target: { name: 'bairro', value: data.bairro || '' } });
      handleInputChange({ target: { name: 'cidade', value: data.localidade || '' } });
      handleInputChange({ target: { name: 'estado', value: data.estado || '' } });

      setDisabledFields({
        endereco: !!data.logradouro,
        bairro: !!data.bairro,
        cidade: !!data.localidade,
        estado: !!data.estado,
      });

      if (data.local) {
        const localFrete = parseFloat(data.local);
        setFrete(localFrete);
      } else if (data.pac || data.sedex) {
        setMetodosFrete({
          pac: data.pac ? parseFloat(data.pac) : null,
          sedex: data.sedex ? parseFloat(data.sedex) : null,
        });
        handleInputChange({ target: { name: 'metodosFrete', value: metodosFrete } });
      } else {
        setFrete(0);
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao buscar o CEP. Verifique e tente novamente.', severity: 'warning' });
      setDisabledFields({
        endereco: false,
        bairro: false,
        cidade: false,
        estado: false,
      });
    } finally {
      setLoadingCep(false);
      return () => {
        isCancelled = true;
      };
    }
  };

  const handleCepChange = (e) => {
    const { value } = e.target;
    handleInputChange({ target: { name: 'cep', value } });

    if (value.length === 8) {
      setFrete(0);
      setModalVisible(false);
    }

    if (errors.cep) {
      setErrors((prev) => ({ ...prev, cep: null }));
    }
  };

  const estadosBrasil = [
    'Acre',
    'Alagoas',
    'Amapá',
    'Amazonas',
    'Bahia',
    'Ceará',
    'Distrito Federal',
    'Espírito Santo',
    'Goiás',
    'Maranhão',
    'Mato Grosso',
    'Mato Grosso do Sul',
    'Minas Gerais',
    'Pará',
    'Paraíba',
    'Paraná',
    'Pernambuco',
    'Piauí',
    'Rio de Janeiro',
    'Rio Grande do Norte',
    'Rio Grande do Sul',
    'Rondônia',
    'Roraima',
    'Santa Catarina',
    'São Paulo',
    'Sergipe',
    'Tocantins',
  ];

  const handleNext = () => {
    const newErrors = {};

    if (tipoEntrega === 'entrega') {
      if (!formData.cep || formData.cep.length !== 8) {
        newErrors.cep = 'CEP é obrigatório e deve conter 8 dígitos.';
      }
      if (!formData.endereco) newErrors.endereco = 'Endereço é obrigatório.';
      if (!formData.numero) newErrors.numero = 'Número é obrigatório.';
      if (!formData.bairro) newErrors.bairro = 'Bairro é obrigatório.';
      if (!formData.cidade) newErrors.cidade = 'Cidade é obrigatória.';
      if (!formData.estado) newErrors.estado = 'Estado é obrigatório.';
    }

    if (tipoEntrega === 'retirada') {
      if (!selectedLocal) {
        newErrors.localRetirada = 'Por favor, selecione um local para retirada.';
      }
    }

    if (!tipoEntrega) {
      newErrors.tipoEntrega = 'Por favor, selecione uma opção: Entrega ou Retirada.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    if (tipoEntrega === 'entrega' && frete === 0) {
      if (metodosFrete.pac || metodosFrete.sedex) {
        setModalVisible(true);
        return;
      } else {
        setSnackbar({ open: true, message: 'Nenhum método de entrega disponível para o CEP informado.', severity: 'warning' });
        return;
      }
    }

    handleInputChange({ target: { name: 'frete', value: frete.toFixed(2) } });
    nextStep();
  };

  const selectedInfo = locaisRetirada.find((local) => local.id === selectedLocal);

  return (
    <Box sx={{ p: 3 }}>
      <Box component="form" noValidate autoComplete="off" sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '600px' }}>
        <Typography variant="body1">Escolha a melhor opção para receber ou retirar o seu produto.</Typography>
        <FormControl component="fieldset" sx={{ mb: 2 }} error={!!errors.tipoEntrega}>
  <RadioGroup
    name="tipoEntrega"
    value={tipoEntrega}
    onChange={handleOptionChange}
    sx={{
      display: 'flex',
      flexDirection: 'row',
      gap: 1.5,  // Gap reduzido
      justifyContent: 'space-evenly',  // Alinhamento equilibrado
      alignItems: 'center',
      mt: 1,
    }}
  >
    <FormControlLabel
      value="entrega"
      control={
        <Radio
          sx={{
            '& .MuiSvgIcon-root': {
              borderColor: '#00796b', // Linha do rádio
            },
            '&.Mui-checked': {
              color: '#00796b', // Cor do rádio selecionado
            },
            '&:hover': {
              backgroundColor: 'rgba(0, 121, 107, 0.1)', // Efeito hover suave
            },
          }}
        />
      }
      label="Entrega"
      sx={{
        '& .MuiFormControlLabel-label': {
          fontWeight: 500,
          color: '#333',
          fontSize: '14px',
        },
      }}
    />
    <FormControlLabel
      value="retirada"
      control={
        <Radio
          sx={{
            '& .MuiSvgIcon-root': {
              borderColor: '#00796b', // Linha do rádio
            },
            '&.Mui-checked': {
              color: '#00796b', // Cor do rádio selecionado
            },
            '&:hover': {
              backgroundColor: 'rgba(0, 121, 107, 0.1)', // Efeito hover suave
            },
          }}
        />
      }
      label="Retirada"
      sx={{
        '& .MuiFormControlLabel-label': {
          fontWeight: 500,
          color: '#333',
          fontSize: '14px',
        },
      }}
    />
  </RadioGroup>
  {errors.tipoEntrega && (
    <Typography variant="body2" color="error" sx={{ mt: 1 }}>
      {errors.tipoEntrega}
    </Typography>
  )}
</FormControl>

        {tipoEntrega === 'entrega' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="CEP"
              name="cep"
              value={formData.cep || ''}
              onChange={(e) => {
                handleCepChange(e);
                if (errors.cep) {
                  setErrors((prev) => ({ ...prev, cep: null }));
                }
              }}
              onBlur={handleCepBlur}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              error={!!errors.cep}
              helperText={errors.cep || (loadingCep ? 'Buscando CEP...' : '')}
            />
            <TextField
              label="Endereço"
              name="endereco"
              value={formData.endereco || ''}
              onChange={handleInputChange}
              disabled={disabledFields.endereco}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Número"
              name="numero"
              value={formData.numero || ''}
              onChange={(e) => {
                handleInputChange(e);
                if (errors.numero) {
                  setErrors((prev) => ({ ...prev, numero: null }));
                }
              }}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              error={!!errors.numero}
              helperText={errors.numero}
            />
            <TextField
              label="Complemento (opcional)"
              name="complemento"
              value={formData.complemento || ''}
              onChange={handleInputChange}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Bairro"
              name="bairro"
              value={formData.bairro || ''}
              onChange={handleInputChange}
              disabled={disabledFields.bairro}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Cidade"
              name="cidade"
              value={formData.cidade || ''}
              onChange={handleInputChange}
              disabled={disabledFields.cidade}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Estado"
              name="estado"
              select
              value={formData.estado || ''}
              onChange={handleInputChange}
              disabled={disabledFields.estado}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            >
              <MenuItem value="" disabled>
                Selecione o Estado
              </MenuItem>
              {estadosBrasil.map((estado) => (
                <MenuItem key={estado} value={estado}>
                  {estado}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        )}

        {modalVisible && (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      bgcolor: 'rgba(0, 0, 0, 0.3)', // Fundo suave e sutil
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1300,
      transition: 'all 0.3s ease', // Suaviza a transição
    }}
  >
    <Box
      sx={{
        width: '90%',
        maxWidth: '400px',
        bgcolor: '#fff',
        borderRadius: '12px',
        padding: '20px',
        textAlign: 'center',
        boxShadow: '0px 6px 24px rgba(0, 0, 0, 0.12)', // Sombra suave e moderna
        transition: 'all 0.3s ease', // Transição suave
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 3,
          fontWeight: '500',
          color: '#333', // Texto escuro para contraste
        }}
      >
        Escolha o tipo de entrega
      </Typography>
      {metodosFrete.pac !== null && (
        <Button
          variant="outlined"
          sx={{
            mb: 2,
            width: '100%',
            borderColor: '#00796b', // Cor suave para borda
            color: '#00796b', // Texto na mesma cor
            fontWeight: '500',
            '&:hover': {
              borderColor: '#004d40', // Cor no hover
              color: '#004d40', // Texto no hover
              backgroundColor: 'rgba(0, 121, 107, 0.1)', // Cor de fundo suave no hover
            },
            transition: 'all 0.2s ease',
          }}
          onClick={() => {
            setFrete(metodosFrete.pac);
            handleInputChange({ target: { name: 'frete', value: metodosFrete.pac.toFixed(2) } });
            handleInputChange({ target: { name: 'tipoFrete', value: 'PAC' } });
            setModalVisible(false);
            nextStep();
          }}
        >
          PAC - R$ {metodosFrete.pac.toFixed(2)}
        </Button>
      )}
      {metodosFrete.sedex !== null && (
        <Button
          variant="outlined"
          sx={{
            width: '100%',
            borderColor: '#0288d1', // Cor suave de borda (azul)
            color: '#0288d1', // Texto na mesma cor
            fontWeight: '500',
            '&:hover': {
              borderColor: '#0277bd', // Cor no hover (azul escuro)
              color: '#0277bd', // Texto no hover
              backgroundColor: 'rgba(2, 136, 209, 0.1)', // Cor de fundo suave no hover
            },
            transition: 'all 0.2s ease',
          }}
          onClick={() => {
            setFrete(metodosFrete.sedex);
            handleInputChange({ target: { name: 'frete', value: metodosFrete.sedex.toFixed(2) } });
            handleInputChange({ target: { name: 'tipoFrete', value: 'SEDEX' } });
            setModalVisible(false);
            nextStep();
          }}
        >
          SEDEX - R$ {metodosFrete.sedex.toFixed(2)}
        </Button>
      )}
    </Box>
  </Box>
)}




        {tipoEntrega === 'retirada' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Local para Retirada"
              name="localRetirada"
              select
              value={selectedLocal}
              onChange={handleLocalChange}
              fullWidth
              size="small"
              error={!!errors.localRetirada}
              helperText={errors.localRetirada}
              InputLabelProps={{ shrink: true }}
            >
              <MenuItem value="">Selecione um Local</MenuItem>
              {locaisRetirada.map((local) => (
                <MenuItem key={local.id} value={local.id}>
                  {local.nome}
                </MenuItem>
              ))}
            </TextField>
            {selectedInfo && (
              <Box sx={{ mt: 2, p: 2, bgcolor: '#f1f8e9', borderRadius: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  📍 {selectedInfo.nome}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  {selectedInfo.endereco}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  🗓️ <b>Segunda à Sexta:</b> {selectedInfo.horarios.semana}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  🗓️ <b>Sábado:</b> {selectedInfo.horarios.sabado}
                </Typography>
                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                  {selectedInfo.horarios.feriados}
                </Typography>
                <Button
                  variant="outlined"
                  sx={{
                    mt: 2,
                    color: '#00695c',
                    borderColor: '#00695c',
                    textTransform: 'none',
                    ':hover': { bgcolor: '#004d40', color: '#fff' },
                  }}
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${selectedInfo.loja}, ${selectedInfo.endereco}`
                      )}&query_place_id=${selectedInfo.coordenadas.lat},${selectedInfo.coordenadas.lng}`
                    )
                  }
                >
                  Ver no Google Maps
                </Button>
              </Box>
            )}
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
<Button
    variant="outlined"
    color="primary"
    onClick={handleNext}
    sx={{
        alignSelf: 'flex-end',
        marginTop: 2,
        borderColor: '#00695c', // Define a cor da borda
        color: '#00695c', // Define a cor do texto
        ':hover': {
            borderColor: '#004d40', // Cor da borda no hover
            backgroundColor: 'transparent', // Fundo transparente no hover
            color: '#004d40', // Cor do texto no hover
        },
    }}
>
            Salvar e avançar
          </Button>
        </Box>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Step2;
