import React, { useState } from 'react';
import HomeIcon from '@mui/icons-material/Home';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import Tooltip from '@mui/material/Tooltip';
import { useAuth0 } from '@auth0/auth0-react';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import logo from '/white_logo.svg';

export default function Sidebar({ activeButton, handleButtonClick }) {
  // État pour garder la trace du bouton actif
  const { isAuthenticated } = useAuth0();

  // Fonction pour gérer le clic et changer le bouton actif

  console.log(isAuthenticated);

  return (
    <aside className='border-r h-screen flex flex-col justify-between items-center px-2 py-4 fill-current text-slate-600 border-slate-400'>
      <div className='items-center flex flex-col gap-3'>
        <div className='rounded-full bg-slate-50 border border-slate-900  text-slate-50 fill-current'>
          <img
            className='w-8 h-8 rounded-full '
            src={logo}
            alt=''
          />
        </div>

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
            className={`transition-colors duration-300 ease-in-out p-2 rounded-lg flex items-center ${
              activeButton === 'home'
                ? 'bg-slate-200 text-slate-900'
                : 'hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <HomeIcon fontSize='small' />
          </button>
        </Tooltip>
        {isAuthenticated && (
          <>
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

            <Tooltip
              title='Personal Informations'
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
                onClick={() => handleButtonClick('upload')}
                className={`transition-colors duration-300 ease-in-out p-2 rounded-lg flex items-center ${
                  activeButton === 'upload'
                    ? 'bg-slate-200 text-slate-900'
                    : 'hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <FileUploadOutlinedIcon fontSize='medium' />
              </button>
            </Tooltip>
          </>
        )}
      </div>
    </aside>
  );
}
