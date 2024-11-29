import React, { useState, ReactNode } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Box,
  useTheme,
} from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';

interface DataSource {
  source: string;
  name: string;
}

interface MenuAction {
  label: string;
  onClick: () => void;
}

export interface CustomInfoCardProps {
  title: React.ReactNode;
  subheader?: React.ReactNode;
  children: ReactNode;
  dataSources?: DataSource[];
  menuActions?: MenuAction[];
}

export const CustomInfoCard = ({
  title,
  subheader,
  children,
  dataSources = [],
  menuActions = [],
}: CustomInfoCardProps) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [sourceMenuAnchor, setSourceMenuAnchor] = useState<null | HTMLElement>(null);

  const isDarkTheme = theme?.palette?.type === 'dark';
  const borderColor = isDarkTheme ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)';

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSourceMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSourceMenuAnchor(event.currentTarget);
  };

  const handleSourceMenuClose = () => {
    setSourceMenuAnchor(null);
  };

  const renderDataSourceNames = () => {
    if (!dataSources.length) return null;
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          fontSize: '18px',
          fontWeight: 'normal',
          color: isDarkTheme ? '#b6b6b6' : '#5C5C5C',
          '& .separator': {
            margin: '0 8px',
            color: borderColor,
          },
        }}
      >
        <span className="separator">|</span>
        {dataSources.map((source, index) => (
          <React.Fragment key={source.name}>
            {index > 0 && <span className="separator">|</span>}
            {source.name}
          </React.Fragment>
        ))}
      </Box>
    );
  };

  const renderSourceButton = () => {
    if (!dataSources.length) return null;
    
    if (dataSources.length === 1) {
      return (
        <Button
          variant="contained"
          onClick={() => window.open(dataSources[0].source, '_blank')}
          style={{
            padding: '6px 16px',
            borderRadius: '4px',
            backgroundColor: isDarkTheme ? '#e8e8e8' : theme.palette.primary.main,
            color: isDarkTheme ? '#000000' : theme.palette.primary.contrastText,
          }}
        >
          GO TO {dataSources[0].name.toUpperCase()}
        </Button>
      );
    }

    return (
      <>
        <Button
          variant="contained"
          endIcon={<KeyboardArrowDownIcon />}
          onClick={handleSourceMenuOpen}
          style={{
            padding: '6px 16px',
            borderRadius: '4px',
            backgroundColor: isDarkTheme ? '#e8e8e8' : theme.palette.primary.main,
            color: isDarkTheme ? '#000000' : theme.palette.primary.contrastText,
          }}
        >
          SOURCES
        </Button>
        <Menu
          anchorEl={sourceMenuAnchor}
          open={Boolean(sourceMenuAnchor)}
          onClose={handleSourceMenuClose}
        >
          {dataSources.map((source, index) => (
            <MenuItem 
              key={index}
              onClick={() => {
                window.open(source.source, '_blank');
                handleSourceMenuClose();
              }}
            >
              {source.name}
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  };

  return (
    <Card
      sx={{
        border: `1px solid ${borderColor}`,
        borderRadius: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <CardHeader
        sx={{
          borderBottom: `1px solid ${borderColor}`,
          height: '84px',
          padding: '20px 24px',
          '& .MuiCardHeader-content': {
            overflow: 'hidden',
          },
          '& .MuiCardHeader-subheader': {
            color: isDarkTheme ? '#b6b6b6' : 'inherit',
          },
        }}
        title={
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              '& .title-text': {
                marginRight: '8px',
              },
            }}
          >
            <span className="title-text">{title}</span>
            {renderDataSourceNames()}
          </Box>
        }
        subheader={subheader}
        action={
          menuActions.length > 0 ? (
            <IconButton aria-label="settings" onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
          ) : null
        }
      />
      {menuActions.length > 0 && (
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {menuActions.map((action, index) => (
            <MenuItem 
              key={index}
              onClick={() => {
                action.onClick();
                handleMenuClose();
              }}
            >
              {action.label}
            </MenuItem>
          ))}
        </Menu>
      )}

      <CardContent
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          fontFamily: 'Roboto',
          color: isDarkTheme ? '#FFFFFF' : '#262626',
          padding: '24px',
        }}
      >
        {children}
      </CardContent>

      <CardActions
        sx={{
          borderTop: `1px solid ${borderColor}`,
          height: '84px',
          padding: '24px',
          justifyContent: 'flex-end',
        }}
      >
        <Box sx={{ marginLeft: 'auto' }}>
          {renderSourceButton()}
        </Box>
      </CardActions>
    </Card>
  );
};