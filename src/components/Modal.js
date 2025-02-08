import React, { useEffect } from 'react';
import {
    Box,
    Typography,
    Fade,
    IconButton,
    Divider,
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
                    bgcolor: 'rgba(0, 0, 0, 0.6)',
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
                        borderRadius: 3,
                        p: 2,
                        maxWidth: 360,
                        width: '90%',
                        boxShadow: 4,
                        position: 'relative',
                        maxHeight: '90%',
                        overflowY: 'auto',
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

                    <Divider sx={{ mb: 2 }} />

                    <Stack spacing={1}>
                        {items.map((item, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    bgcolor: '#f3f3f3',
                                    p: 2,
                                    borderRadius: 2,
                                    boxShadow: 1,
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
                </Box>
            </Box>
        </Fade>
    );
};

export default Modal;
