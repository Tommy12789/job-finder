import React, { useState } from 'react';
import HomeIcon from '@mui/icons-material/Home';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import Tooltip from '@mui/material/Tooltip';

export default function Sidebar({ onSectionClick }) {
  // État pour garder la trace du bouton actif
  const [activeButton, setActiveButton] = useState('home');

  // Fonction pour gérer le clic et changer le bouton actif
  const handleButtonClick = (section) => {
    setActiveButton(section);
    onSectionClick(section);
  };

  return (
    <aside className='border-r h-screen flex flex-col justify-between items-center px-2 py-4 fill-current text-slate-600 border-slate-400'>
      <div className='items-center flex flex-col gap-3'>
        {/* Bouton "Home" toujours actif avec fond noir */}
        <Tooltip
          title='Home'
          placement='right-start'
          componentsProps={{
            tooltip: {
              sx: {
                fontWeight: '400',
                bgcolor: '#f8fafc',
                color: '#0f172a',
                padding: '4px 10px',
                fontSize: '14px',
                borderRadius: '8px',
                border: 'solid #e2e8f0',
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
              },
            },
          }}
        >
          <button
            onClick={() => handleButtonClick('home')}
            className='text-slate-200 transition-colors duration-300 ease-in-out rounded-full flex items-center bg-slate-900 p-2'
          >
            <HomeIcon fontSize='small' />
          </button>
        </Tooltip>
        <Tooltip
          title='Search'
          placement='right-start'
          componentsProps={{
            tooltip: {
              sx: {
                fontWeight: '400',
                bgcolor: '#f8fafc',
                color: '#0f172a',
                padding: '4px 10px',
                fontSize: '14px',
                borderRadius: '8px',
                border: 'solid #e2e8f0',
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
              },
            },
          }}
        >
          <button
            onClick={() => handleButtonClick('search')}
            className={`transition-colors duration-300 ease-in-out p-2 rounded-lg flex items-center ${
              activeButton === 'search'
                ? 'bg-slate-200 text-slate-900'
                : 'hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <SearchRoundedIcon fontSize='small' />
          </button>
        </Tooltip>
        <Tooltip
          title='Favorites'
          placement='right-start'
          componentsProps={{
            tooltip: {
              sx: {
                fontWeight: '400',
                bgcolor: '#f8fafc',
                color: '#0f172a',
                padding: '4px 10px',
                fontSize: '14px',
                borderRadius: '8px',
                border: 'solid #e2e8f0',
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
              },
            },
          }}
        >
          <button
            onClick={() => handleButtonClick('favorites')}
            className={`transition-colors duration-300 ease-in-out p-2 rounded-lg flex items-center ${
              activeButton === 'favorites'
                ? 'bg-slate-200 text-slate-900'
                : 'hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <FavoriteBorderRoundedIcon fontSize='small' />
          </button>
        </Tooltip>
      </div>
      <div>
        <Tooltip
          title='Settings'
          placement='right-start'
          componentsProps={{
            tooltip: {
              sx: {
                fontWeight: '400',
                bgcolor: '#f8fafc',
                color: '#0f172a',
                padding: '4px 10px',
                fontSize: '14px',
                borderRadius: '8px',
                border: 'solid #e2e8f0',
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
              },
            },
          }}
        >
          <button
            onClick={() => handleButtonClick('settings')}
            className={`transition-colors duration-300 ease-in-out p-2 rounded-lg flex items-center ${
              activeButton === 'settings'
                ? 'bg-slate-200 text-slate-900'
                : 'hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <SettingsRoundedIcon fontSize='medium' />
          </button>
        </Tooltip>
      </div>
    </aside>
  );
}
