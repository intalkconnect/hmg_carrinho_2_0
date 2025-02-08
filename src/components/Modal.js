import React, { useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Fade,
    IconButton,
    Stack,
} from '@mui/material';
import { Close } from '@mui/icons-material';

const capitalizeFirstLetter = (string) =>
    string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();

const Modal = ({ isVisible, onClose, items }) => {
    useEffect(() => {
        const handleEscapeKey = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        if (isVisible) {
            document.addEventListener('keydown', handleEscapeKey);
        }
        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [isVisible, onClose]);

    return (
        <Fade in={isVisible}>
            <Box
                sx={{
                    position: 'fixed',
                    inset: 0,
                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1300,
                }}
                onClick={onClose}
            >
                <Box
                    sx={{
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        p: 3,
                        maxWidth: 400,
                        width: '90%',
                        boxShadow: 6,
                        position: 'relative',
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <IconButton
                        onClick={onClose}
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            color: 'text.secondary',
                        }}
                    >
                        <Close />
                    </IconButton>

                    <Typography
                        variant="h6"
                        sx={{
                            mb: 2,
                            textAlign: 'center',
                            fontWeight: 'bold',
                            color: 'primary.main',
                        }}
                    >
                        Comanda do Pedido
                    </Typography>

                    <Stack spacing={2} sx={{ maxHeight: 250, overflowY: 'auto' }}>
                        {items.map((item, index) => (
                            <Box
                                key={index}
                                sx={{
                                    bgcolor: '#f9f9f9',
                                    borderRadius: 1,
                                    p: 2,
                                    boxShadow: 2,
                                }}
                            >
                                <Typography
                                    variant="body1"
                                    sx={{ fontWeight: 'bold', color: 'text.primary' }}
                                >
                                    {capitalizeFirstLetter(item.orc_Produto_Nome)}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{ color: 'text.secondary' }}
                                >
                                    {item.orc_Produto_quantidade} {item.orc_Produto_unidade}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>

                    <Button
                        variant="contained"
                        color="primary"
                        sx={{
                            mt: 3,
                            display: 'block',
                            mx: 'auto',
                            textTransform: 'none',
                            ':hover': { bgcolor: 'primary.dark' },
                        }}
                        onClick={onClose}
                    >
                        Fechar Comanda
                    </Button>
                </Box>
            </Box>
        </Fade>
    );
};

export default Modal;
