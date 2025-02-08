import React, { useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Fade,
    IconButton,
} from '@mui/material';
import { Close, Circle } from '@mui/icons-material';

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
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    bgcolor: 'rgba(0, 0, 0, 0.6)',
                    display: isVisible ? 'flex' : 'none',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1300,
                }}
                onClick={(e) => {
                    e.preventDefault();
                    onClose();
                }}
            >
                <Box
                    sx={{
                        bgcolor: 'white',
                        borderRadius: 4,
                        p: 4,
                        maxWidth: 520,
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
                            color: '#00695c',
                        }}
                    >
                        <Close />
                    </IconButton>

                    <Typography
                        variant="h5"
                        sx={{
                            mb: 2,
                            color: '#00695c',
                            textAlign: 'center',
                            fontWeight: 'bold',
                        }}
                    >
                        Detalhes do Produto
                    </Typography>

                    <Divider sx={{ mb: 3 }} />

                    <List disablePadding>
                        {items.map((item, index) => (
                            <React.Fragment key={index}>
                                <ListItem sx={{ py: 1.5 }}>
                                    <ListItemIcon>
                                        <Circle sx={{ color: '#00695c', fontSize: 10 }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Typography
                                                variant="body1"
                                                sx={{ color: '#333', fontWeight: 'bold' }}
                                            >
                                                {capitalizeFirstLetter(item.orc_Produto_Nome)}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography variant="body2" sx={{ color: '#666' }}>
                                                {item.orc_Produto_quantidade}{' '}
                                                {item.orc_Produto_unidade}
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                                {index < items.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </List>

                    <Button
                        variant="contained"
                        color="success"
                        sx={{
                            mt: 3,
                            display: 'block',
                            mx: 'auto',
                            bgcolor: '#00695c',
                            fontSize: '0.9rem',
                            ':hover': { bgcolor: '#004d40' },
                        }}
                        onClick={onClose}
                    >
                        Fechar
                    </Button>
                </Box>
            </Box>
        </Fade>
    );
};

export default Modal;
