import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
    Snackbar,
    Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';

// Importe as imagens
import Logo1 from '../assets/logo.webp';
import LogoCentro from '../assets/logo1.png';

// Estilos constantes
const STYLES = {
    fullScreenCenter: {
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullScreenColumnCenter: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: '#f8f8f8',
        color: '#555',
    },
    checkoutBackground: {
        bgcolor: '#f4f8fa',
        minHeight: '100vh',
        margin: 0,
        padding: 0,
        width: '100vw',
        overflowX: 'hidden',
    },
    appBar: {
        bgcolor: '#00BFBE',
        margin: 0,
        padding: 0,
    }
};

const Checkout = React.memo(() => {
    const { orcamentos, updateTotalValue, status } = useOrcamentos();
    const [expanded, setExpanded] = useState('step1');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalItems, setModalItems] = useState([]);
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
        severity: 'info',
    });

    // Cálculo otimizado do valor total com useMemo
    const totalValue = useMemo(() => {
        const produtosValidos = orcamentos.filter((produto) => produto.orc_qt_potes > 0);
        return produtosValidos.reduce(
            (sum, produto) => sum + produto.orc_qt_potes * produto.orc_valor_liquido,
            0
        ) + parseFloat(formData.frete || 0);
    }, [orcamentos, formData.frete]);

    // Otimização de funções com useCallback
    const handleSnackbarClose = useCallback(() => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    }, []);

    // Função de submissão do checkout com tratamento de erros
    const handleCheckoutSubmission = useCallback(() => {
        // Lógica anterior de validação e envio
        if (!Array.isArray(orcamentos) || orcamentos.length === 0) {
            setSnackbar({
                open: true, 
                message: 'Nenhum produto selecionado. Adicione produtos antes de finalizar o pedido.', 
                severity: 'info'
            });
            return;
        }

        const produtosValidos = orcamentos.filter((produto) => produto.orc_qt_potes > 0);
        
        if (produtosValidos.length === 0) {
            setSnackbar({
                open: true, 
                message: 'Nenhum produto com quantidade válida. Ajuste o carrinho antes de finalizar o pedido.', 
                severity: 'warning'
            });
            return;
        }

        const id = window.location.pathname.replace('/', '');
        const orcPaciente = orcamentos[0]?.orc_paciente;
        
        if (!orcPaciente) {
            setSnackbar({
                open: true, 
                message: 'Erro ao processar o cliente. Verifique os dados e tente novamente.', 
                severity: 'error'
            });
            return;
        }

        const payload = {
            checkout: id,
            dataFim: new Date().toISOString(),
            dadosPessoais: {
                nomeCompleto: formData.nomeCompleto,
                cpf: formData.cpf,
                rg: formData.rg,
                celular: formData.celular,
                email: formData.email,
            },
            enderecoEntrega: formData.tipoEntrega === 'entrega' ? {
                endereco: formData.endereco,
                numero: formData.numero,
                complemento: formData.complemento,
                bairro: formData.bairro,
                cidade: formData.cidade,
                estado: formData.estado,
                cep: formData.cep,
                tipoFrete: formData.tipoFrete
            } : "Local",
            localRetirada: formData.tipoEntrega === 'retirada' ? formData.localRetirada : null,
            formaPagamento: formData.formaPagamento || "pix",
            produtos: produtosValidos,
            frete: parseFloat(formData.frete),
            total: produtosValidos.reduce((sum, produto) => sum + produto.orc_qt_potes * produto.orc_valor_liquido, 0) + parseFloat(formData.frete),
            identity: orcPaciente.replace(/^B/, '') + '@wa.gw.msging.net'
        };

        fetch('https://endpoints-checkout.rzyewu.easypanel.host/finish-checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
        .then((response) => {
            if (response.ok) {
                setSnackbar({
                    open: true, 
                    message: 'Pedido finalizado com sucesso!', 
                    severity: 'success'
                });
            } else {
                setSnackbar({ 
                    open: true, 
                    message: 'Erro ao finalizar pedido. Tente novamente.', 
                    severity: 'error' 
                });
            }
        })
        .catch((error) => {
            console.error("Erro ao conectar ao servidor:", error);
            setSnackbar({ 
                open: true, 
                message: 'Erro ao conectar ao servidor. Verifique sua conexão e tente novamente.', 
                severity: 'error' 
            });
        });
    }, [orcamentos, formData]);

    // Efeito para manipulação de estilos do body
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

    // Renderizações condicionais
    if (!status) {
        return (
            <Box sx={STYLES.fullScreenCenter}>
                <img
                    src={LogoCentro}
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

    // Renderizações para status específicos
    const StatusRenderMap = {
        'expired': () => (
            <Box sx={STYLES.fullScreenColumnCenter}>
                <ShoppingCartOutlinedIcon sx={{ fontSize: 80, color: '#ff9800', marginBottom: 2 }} />
                <Typography variant="h5" sx={{ textAlign: 'center', marginBottom: 2 }}>
                    Este link expirou. Por favor, solicite um novo orçamento.
                </Typography>
            </Box>
        ),
        'confirmed': () => (
            <Box sx={STYLES.fullScreenColumnCenter}>
                <ShoppingCartOutlinedIcon sx={{ fontSize: 80, color: '#ff9800', marginBottom: 2 }} />
                <Typography variant="h5" sx={{ textAlign: 'center', marginBottom: 2 }}>
                    Essa compra já foi finalizada.
                </Typography>
            </Box>
        ),
        'invalid': () => (
            <Box sx={STYLES.fullScreenColumnCenter}>
                <ShoppingCartOutlinedIcon sx={{ fontSize: 80, color: '#00695c', marginBottom: 2 }} />
                <Typography variant="h5" sx={{ textAlign: 'center', marginBottom: 2 }}>
                    Carrinho não encontrado.
                </Typography>
                <Typography variant="body1" sx={{ textAlign: 'center' }}>
                    Verifique o link ou tente novamente mais tarde.
                </Typography>
            </Box>
        )
    };

    // Renderização de status específicos
    const specificStatusRender = StatusRenderMap[status];
    if (specificStatusRender) return specificStatusRender();

    // Renderização se não houver ID no pathname
    if (!window.location.pathname.replace('/', '')) {
        return (
            <Box sx={{
                ...STYLES.fullScreenColumnCenter,
                bgcolor: '#f4f8fa',
            }}>
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

    // Funções de gerenciamento de etapas
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }, []);

    const handleAccordionChange = useCallback((panel) => (event, isExpanded) => {
        if (
            (panel === 'step2' && !isStep1Completed) ||
            (panel === 'step3' && !isStep2Completed)
        ) {
            return;
        }
        setExpanded(isExpanded ? panel : false);
    }, [isStep1Completed, isStep2Completed]);

    const handleStep1Complete = useCallback(() => {
        if (formData.nomeCompleto && formData.cpf && formData.celular) {
            setIsStep1Completed(true);
            setExpanded('step2');
        } else {
            setSnackbar({
                open: true, 
                message: 'Por favor, preencha todos os campos obrigatórios.', 
                severity: 'warning'
            });
        }
    }, [formData]);

    const handleStep2Complete = useCallback(() => {
        setIsStep2Completed(true);
        setExpanded('step3');
    }, []);

    const handleOpenModal = useCallback((items) => {
        setModalItems(items);
        setIsModalVisible(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalVisible(false);
    }, []);

    return (
        <Box sx={STYLES.checkoutBackground}>
            <AppBar
                id="header"
                position="static"
                elevation={0}
                sx={STYLES.appBar}
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
                                expandIcon={<ExpandMoreIcon sx={{ color: '#00695c' }} />}
                                sx={{ bgcolor: expanded === 'step1' ? '#e8f5e9' : '#ffffff' }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {isStep1Completed ? (
                                        <CheckCircleIcon sx={{ color: '#81c784' }} />
                                    ) : (
                                        <RadioButtonUncheckedIcon sx={{ color: '#00695c' }} />
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
                                expandIcon={<ExpandMoreIcon sx={{ color: '#00695c' }} />}
                                sx={{ bgcolor: expanded === 'step2' ? '#e8f5e9' : '#ffffff' }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {isStep2Completed ? (
                                        <CheckCircleIcon sx={{ color: '#81c784' }} />
                                    ) : (
                                        <RadioButtonUncheckedIcon sx={{ color: '#00695c' }} />
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
                                expandIcon={<ExpandMoreIcon sx={{ color: '#00695c' }} />}
                                sx={{ bgcolor: expanded === 'step3' ? '#e8f5e9' : '#ffffff' }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <RadioButtonUncheckedIcon sx={{ color: '#00695c' }} />
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
                                    finalizeCheckout={handleCheckoutSubmission}
                                    totalValue={totalValue}
                                />
                            </AccordionDetails>
                        </Accordion>
                    </Grid>
                </Grid>
            </Container>
           
            {isModalVisible && (
                <Modal
                    isVisible={isModalVisible}
                    onClose={handleCloseModal}
                    items={modalItems}
                />
            )}
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
});

export default Checkout;
