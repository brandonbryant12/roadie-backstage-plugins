import React, { useState, ReactNode } from 'react';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { Theme } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((_: Theme) => ({
  separator: {
    margin: '0 8px',
    color: ({ isDark }: { isDark: boolean }) => 
      isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
  },
  titleText: {
    marginRight: '8px',
  },
  cardContent: {
    flexGrow: 1,
    overflowY: 'auto',
    fontFamily: 'Roboto',
    padding: '24px',
  },
  cardHeader: {
    '& .MuiCardHeader-content': {
      overflow: 'hidden',
    },
  }
}));

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
  const isDarkTheme = theme?.palette?.type === 'dark';
  const classes = useStyles({ isDark: isDarkTheme });
  const borderColor = isDarkTheme ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)';

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [sourceMenuAnchor, setSourceMenuAnchor] = useState<null | HTMLElement>(null);

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
        }}
      >
        <span className={classes.separator}>|</span>
        {dataSources.map((source, index) => (
          <React.Fragment key={source.name}>
            {index > 0 && <span className={classes.separator}>|</span>}
            {source.name}
          </React.Fragment>
        ))}
      </Box>
    );
  };

  const renderSourceButton = () => {
    if (!dataSources.length) return null;
    
    const buttonStyle = {
      padding: '6px 16px',
      borderRadius: '4px',
      backgroundColor: isDarkTheme ? '#e8e8e8' : theme.palette.primary.main,
      color: isDarkTheme ? '#000000' : theme.palette.primary.contrastText,
    };
    
    if (dataSources.length === 1) {
      return (
        <Button
          variant="contained"
          onClick={() => window.open(dataSources[0].source, '_blank')}
          style={buttonStyle}
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
          style={buttonStyle}
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
    <Card style={{
      border: `1px solid ${borderColor}`,
      borderRadius: 4,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      <CardHeader
        className={classes.cardHeader}
        style={{
          borderBottom: `1px solid ${borderColor}`,
          height: '84px',
          padding: '20px 24px',
        }}
        title={
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
          }}>
            <span className={classes.titleText}>{title}</span>
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

      <CardContent className={classes.cardContent}>
        {children}
      </CardContent>

      <CardActions style={{
        borderTop: `1px solid ${borderColor}`,
        height: '84px',
        padding: '24px',
        justifyContent: 'flex-end',
      }}>
        <Box sx={{ marginLeft: 'auto' }}>
          {renderSourceButton()}
        </Box>
      </CardActions>
    </Card>
  );
};