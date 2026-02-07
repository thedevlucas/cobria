// Quick Add Phone Component - Senior Developer Implementation
import React, { useState } from 'react';
import {
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Tooltip,
  Box,
  Typography,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
  ContactPhone as ContactPhoneIcon,
  Smartphone as SmartphoneIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import EnhancedCreatePhone from '../dialog/EnhancedCreatePhone';

interface QuickAddPhoneProps {
  onPhoneCreated?: (phoneData: any) => void;
  showBadge?: boolean;
  badgeCount?: number;
}

const QuickAddPhone: React.FC<QuickAddPhoneProps> = ({
  onPhoneCreated,
  showBadge = false,
  badgeCount = 0
}) => {
  const [open, setOpen] = useState(false);
  const [showSpeedDial, setShowSpeedDial] = useState(false);

  const actions = [
    {
      icon: <SmartphoneIcon />,
      name: 'Agregar Celular',
      tooltip: 'Agregar número de celular',
      onClick: () => {
        setOpen(true);
        setShowSpeedDial(false);
      }
    },
    {
      icon: <ContactPhoneIcon />,
      name: 'Agregar Teléfono Fijo',
      tooltip: 'Agregar teléfono fijo',
      onClick: () => {
        setOpen(true);
        setShowSpeedDial(false);
      }
    },
    {
      icon: <PersonAddIcon />,
      name: 'Nuevo Deudor',
      tooltip: 'Crear deudor y teléfono',
      onClick: () => {
        setOpen(true);
        setShowSpeedDial(false);
      }
    }
  ];

  const handlePhoneCreated = (phoneData: any) => {
    if (onPhoneCreated) {
      onPhoneCreated(phoneData);
    }
    setOpen(false);
  };

  return (
    <>
      {/* Quick Add Button */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000
        }}
      >
        {/* Badge for notifications */}
        {showBadge && (
          <Paper
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              bgcolor: 'error.main',
              color: 'white',
              borderRadius: '50%',
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              zIndex: 1001
            }}
          >
            {badgeCount}
          </Paper>
        )}

        {/* Speed Dial */}
        <SpeedDial
          ariaLabel="Agregar teléfono"
          sx={{
            '& .MuiFab-primary': {
              width: 56,
              height: 56,
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark'
              }
            }
          }}
          icon={<SpeedDialIcon icon={<AddIcon />} openIcon={<CloseIcon />} />}
          onClose={() => setShowSpeedDial(false)}
          onOpen={() => setShowSpeedDial(true)}
          open={showSpeedDial}
        >
          {actions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    {action.name}
                  </Typography>
                  <Typography variant="caption">
                    {action.tooltip}
                  </Typography>
                </Box>
              }
              onClick={action.onClick}
              sx={{
                '& .MuiFab-root': {
                  width: 48,
                  height: 48,
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.50'
                  }
                }
              }}
            />
          ))}
        </SpeedDial>
      </Box>

      {/* Enhanced Create Phone Dialog */}
      <EnhancedCreatePhone
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={handlePhoneCreated}
      />

      {/* Quick Add Tooltip */}
      {!showSpeedDial && (
        <Tooltip
          title={
            <Box>
              <Typography variant="body2" fontWeight="bold">
                Agregar Teléfono
              </Typography>
              <Typography variant="caption">
                Haz clic para agregar un nuevo teléfono
              </Typography>
            </Box>
          }
          placement="left"
        >
          <Box
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 999
            }}
          />
        </Tooltip>
      )}
    </>
  );
};

export default QuickAddPhone;


