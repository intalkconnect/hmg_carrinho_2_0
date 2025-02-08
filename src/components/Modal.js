import React, { useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    List,
    ListItem,
    ListItemText,
    Fade,
    IconButton,
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
                            color: 'text.primary',
                            textAlign: 'center',
                            fontWeight: 'bold',
                        }}
                    >
                        Detalhes do Produto
                    </Typography>

                    <List sx={{ maxHeight: 200, overflowY: 'auto', px: 1 }}>
                        {items.map((item, index) => (
                            <ListItem key={index} disableGutters sx={{ py: 1 }}>
                                <ListItemText
                                    primary={capitalizeFirstLetter(item.orc_Produto_Nome)}
                                    secondary={`${item.orc_Produto_quantidade} ${item.orc_Produto_unidade}`}
                                    primaryTypographyProps={{
                                        variant: 'body1',
                                        fontWeight: 'medium',
                                    }}
                                    secondaryTypographyProps={{
                                        variant: 'body2',
                                        color: 'text.secondary',
                                    }}
                                />
                            </ListItem>
                        ))}
                    </List>

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
                        Fechar
                    </Button>
                </Box>
            </Box>
        </Fade>
    );
};

export default Modal;
