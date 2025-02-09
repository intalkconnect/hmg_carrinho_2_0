import React, { useState, useEffect } from 'react';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import Summary from './Summary';
import Modal from './Modal';
import useOrcamentos from '../hooks/useOrcamentos';
import {
    Box,
    Grid,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    AppBar,
    Toolbar,
    Container,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { CircleCheckBig, CircleUser, Package, CreditCard, CircleChevronDown, CircleChevronUp } from "lucide-react";
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'; // Importa o ícone

import { Snackbar, Alert } from '@mui/material';
// Importe as imagens
import Logo1 from '../assets/logo.webp';
import LogoCentro from '../assets/logo1.png';
import { calculateTotalValue, handleCheckoutSubmission, handleSnackbarOpen } from '../utils/helpers';


const Checkout = () => {
    const { orcamentos, updateTotalValue, status } = useOrcamentos();
    const [expanded, setExpanded] = useState('step1');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalItems, setModalItems] = useState([]);
    const [totalValue, setTotalValue] = useState(0); // Adicionado para cálculo do valor total


    const [formData, setFormData] = useState({
        nomeCompleto: '',
        cpf: '',
        rg: '',
        celular: '',
        email: '',
        tipoEntrega: '',
        tipoFrete: '',
        frete: 0,
        formaPagamento: ''
    });

    const [isStep1Completed, setIsStep1Completed] = useState(false);
    const [isStep2Completed, setIsStep2Completed] = useState(false);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'info', // 'success', 'error', 'warning', 'info'
    });

    const handleSnackbarClose = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    useEffect(() => {
        const originalStyles = {
            margin: document.body.style.margin,
            padding: document.body.style.padding,
            overflowX: document.body.style.overflowX
        };

        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.overflowX = 'hidden';

        return () => {
            document.body.style.margin = originalStyles.margin;
            document.body.style.padding = originalStyles.padding;
            document.body.style.overflowX = originalStyles.overflowX;
        };
    }, []);

    useEffect(() => {
        setTotalValue(calculateTotalValue(orcamentos, formData.frete));
    }, [orcamentos, formData.frete]);

    if (!status) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    bgcolor: '#ffffff',
                }}
            >
                <img
                    src={LogoCentro} // Substitua pelo caminho da sua imagem
                    alt="Carregando"
                    style={{
                        maxWidth: '300px',
                        maxHeight: '300px',
                        width: '100%',
                        height: 'auto',
                    }}
                />
            </Box>
        );
    }

    // Exibe mensagens baseadas no status do orçamento
    if (status === 'expired') {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    bgcolor: '#f8f8f8',
                    color: '#555',
                }}
            >
                <ShoppingCartOutlinedIcon sx={{ fontSize: 80, color: '#ff9800', marginBottom: 2 }} />
                <Typography variant="h5" sx={{ textAlign: 'center', marginBottom: 2 }}>
                    Este link expirou. Por favor, solicite um novo orçamento..
                </Typography>
            </Box>
        );
    }

    if (status === 'confirmed') {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    bgcolor: '#f8f8f8',
                    color: '#555',
                }}
            >
                <ShoppingCartOutlinedIcon sx={{ fontSize: 80, color: '#ff9800', marginBottom: 2 }} />
                <Typography variant="h5" sx={{ textAlign: 'center', marginBottom: 2 }}>
                    Essa compra já foi finalizada.
                </Typography>
            </Box>
        );
    }

    if (status !== 'confirmed' && status !== 'expired' && status !== 'pending') {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    bgcolor: '#f8f8f8',
                    color: '#555',
                }}
            >
                <ShoppingCartOutlinedIcon sx={{ fontSize: 80, color: '#ff9800', marginBottom: 2 }} />
                <Typography variant="h5" sx={{ textAlign: 'center', marginBottom: 2 }}>
                    Carrinho não encontrado.
                </Typography>
                <Typography variant="body1" sx={{ textAlign: 'center' }}>
                    Verifique o link ou tente novamente mais tarde.
                </Typography>
            </Box>
        );
    }


    // Função para coletar dados e enviar para a API
    const handleCheckout = () => {
        handleCheckoutSubmission(orcamentos, formData, setSnackbar);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    const handleAccordionChange = (panel) => (event, isExpanded) => {
        if (
            (panel === 'step2' && !isStep1Completed) ||
            (panel === 'step3' && !isStep2Completed)
        ) {
            return;
        }
        setExpanded(isExpanded ? panel : false);
    };

    const handleStep1Complete = () => {
        if (formData.nomeCompleto && formData.cpf && formData.celular) {
            setIsStep1Completed(true);
            setExpanded('step2');
        } else {
            handleSnackbarOpen(setSnackbar, {
                message: 'Por favor, preencha todos os campos obrigatórios.',
                severity: 'warning',
            });

        }
    };

    const handleStep2Complete = () => {
        setIsStep2Completed(true);
        setExpanded('step3');
    };

    const handleOpenModal = (items) => {
        setModalItems(items);
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
    };

    if (!window.location.pathname.replace('/', '')) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    bgcolor: '#f4f8fa',
                    color: '#555',
                }}
            >
                <ShoppingCartOutlinedIcon sx={{ fontSize: 80, color: '#00695c', marginBottom: 2 }} />
                <Typography variant="h5" sx={{ textAlign: 'center', marginBottom: 2 }}>
                    Seu carrinho está vazio.
                </Typography>
                <Typography variant="body1" sx={{ textAlign: 'center' }}>
                    Adicione produtos antes de continuar.
                </Typography>
            </Box>
        );
    }


    return (
<Box
    sx={{
        bgcolor: '#f4f8fa',
        minHeight: '100vh',
        margin: 0,
        padding: 0,
        width: '100vw',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column'
    }}
>
            <AppBar
                id="header" // Adicionado ID para facilitar a captura
                position="static"
                elevation={0}
                sx={{
                    bgcolor: '#00BFBE',
                    margin: 0,
                    padding: 0,
                }}
            >
                <Toolbar>
                    <Container sx={{
                        padding: 0,
                        maxWidth: '100%',
                    }}>
                        <img src={Logo1} alt="Logo 1" style={{ height: 80 }} />
                    </Container>
                </Toolbar>
            </AppBar>

            <Container sx={{ marginTop: 3, marginBottom: 3 }}>
                <Grid container spacing={3}>
                    <Grid
                        item
                        xs={12}
                        md={5}
                        sx={{
                            order: { xs: 1, md: 2 },
                        }}
                    >
                        <Summary
                            orcamentos={orcamentos}
                            updateTotalValue={updateTotalValue}
                            frete={formData.frete}
                            onOpenModal={handleOpenModal}
                        />
                    </Grid>

                    <Grid
                        item
                        xs={12}
                        md={7}
                        sx={{
                            order: { xs: 2, md: 1 },
                        }}
                    >
                        <Accordion
    expanded={expanded === 'step1'}
    onChange={handleAccordionChange('step1')}
    sx={{
        marginBottom: 2,
        border: '1px solid #ddd',
        borderRadius: 2,
    }}
>
    <AccordionSummary
    expandIcon={
        <div style={{
            transform: expanded === 'step1' ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease'
        }}>
            {expanded === 'step1' ? (
                <CircleChevronUp color="#00695c" />
            ) : (
                <CircleChevronDown color="#00695c" />
            )}
        </div>
    }
    sx={{ bgcolor: expanded === 'step1' ? '#e8f5e9' : '#ffffff' }}
>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isStep1Completed ? (
                <CircleCheckBig color="#00695c" />
            ) : (
                <CircleUser color="#00695c" />
            )}
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#00695c' }}>
                Dados Pessoais
            </Typography>
        </Box>
    </AccordionSummary>
    <AccordionDetails>
        <Step1
            formData={formData}
            handleInputChange={handleInputChange}
            nextStep={handleStep1Complete}
        />
    </AccordionDetails>
</Accordion>

<Accordion
    expanded={expanded === 'step2'}
    onChange={handleAccordionChange('step2')}
    disabled={!isStep1Completed}
    sx={{
        marginBottom: 2,
        border: '1px solid #ddd',
        borderRadius: 2,
    }}
>
    <AccordionSummary
    expandIcon={
        <div style={{
            transform: expanded === 'step2' ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease'
        }}>
            {expanded === 'step2' ? (
                <CircleChevronUp color="#00695c" />
            ) : (
                <CircleChevronDown color="#00695c" />
            )}
        </div>
    }
    sx={{ bgcolor: expanded === 'step2' ? '#e8f5e9' : '#ffffff' }}
>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isStep2Completed ? (
                <CircleCheckBig color="#00695c" />
            ) : (
                <Package color="#00695c" />
            )}
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#00695c' }}>
                Entrega ou Retirada
            </Typography>
        </Box>
    </AccordionSummary>
    <AccordionDetails>
        <Step2
            formData={formData}
            handleInputChange={handleInputChange}
            nextStep={handleStep2Complete}
            prevStep={() => setExpanded('step1')}
        />
    </AccordionDetails>
</Accordion>

<Accordion
    expanded={expanded === 'step3'}
    onChange={handleAccordionChange('step3')}
    disabled={!isStep2Completed}
    sx={{
        marginBottom: 2,
        border: '1px solid #ddd',
        borderRadius: 2,
    }}
>
    <AccordionSummary
    expandIcon={
        <div style={{
            transform: expanded === 'step3' ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease'
        }}>
            {expanded === 'step3' ? (
                <CircleChevronUp color="#00695c" />
            ) : (
                <CircleChevronDown color="#00695c" />
            )}
        </div>
    }
    sx={{ bgcolor: expanded === 'step3' ? '#e8f5e9' : '#ffffff' }}
>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CreditCard color="#00695c" />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#00695c' }}>
                Formas de Pagamento
            </Typography>
        </Box>
    </AccordionSummary>
    <AccordionDetails>
        <Step3
            formData={formData}
            handleInputChange={handleInputChange}
            prevStep={() => setExpanded('step2')}
            finalizeCheckout={handleCheckout}
            totalValue={totalValue}
        />
    </AccordionDetails>
</Accordion>

                    </Grid>
                </Grid>
            </Container>
<Box 
    component="footer" 
    sx={{
        bgcolor: '#f8f8f8',
        borderTop: '1px solid #e0e0e0',
        py: 3,
        px: 2,
        mt: 'auto'
    }}
>
    <Container maxWidth="lg">
        <Typography 
            variant="body2" 
            align="center" 
            sx={{ 
                color: '#666666',
                fontSize: '0.75rem',
                lineHeight: 1.6
            }}
        >
            Nature Derme Pharmácia de manipulação Ltda
            <br />
            CNPJ: 25.391.756/0001-30 | Farmacêutico Responsável: Leonardo Tomaz Alves | CRF: 24992
        </Typography>
        
        <Typography 
            variant="body2" 
            align="center" 
            sx={{ 
                color: '#666666',
                fontSize: '0.75rem',
                mt: 2,
                fontStyle: 'italic'
            }}
        >
            As informações contidas neste site não devem ser usadas para automedicação e não substituem, 
            em hipótese alguma, as orientações dadas pelo profissional da área médica. 
            Somente o médico está apto a diagnosticar qualquer problema de saúde e prescrever o tratamento adequado.
        </Typography>
        
        <Typography 
            variant="body2" 
            align="center" 
            sx={{ 
                color: '#666666',
                fontSize: '0.75rem',
                mt: 2,
                fontWeight: 'medium'
            }}
        >
            Ao persistirem os sintomas, um médico deverá ser consultado.
        </Typography>
    </Container>
</Box>

            {isModalVisible && (
                <Modal
                    isVisible={isModalVisible}
                    onClose={handleCloseModal}
                    items={modalItems}
                />
            )}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000} // Fecha automaticamente após 6 segundos
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // Posição no topo central
            >
                <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>

    );
};

export default Checkout;
