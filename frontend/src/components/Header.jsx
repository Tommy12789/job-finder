import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useState, useEffect } from 'react';
import Profile from './Profile';
import LoginButton from './LoginButton';
import LogoutButton from './LogoutButton';

export default function Header({ selectedSection, isAuthenticated, handleButtonClick }) {
  const [isVisible, setIsVisible] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  function Capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <header className={`bg-slate-50 w-full py-2 flex items-center justify-between px-10 text-slate-700 ${
      isVisible ? 'animate-slideInBottom' : 'translate-y-full opacity-0'
    }`}>
      <p>{Capitalize(selectedSection)}</p>
      <button
        onClick={handleClick}
        className='flex items-center rounded-full bg-white p-2 border hover:shadow-inner transition-all ease-in-out duration-300'
      >
        <PersonRoundedIcon className='text-slate-900' />
      </button>{' '}
      <Menu
        id='basic-menu'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        PaperProps={{
          style: {
            border: 'solid #e2e8f0',
            marginTop: '5px',
            borderRadius: '12px', // Coins arrondis
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', // Ombre douce
          },
        }}
      >
        <div className='flex flex-col items-center'>
          {isAuthenticated && <Profile />}
          <p className='px-6 py-2 border-b border-slate-200 w-full'>
            <strong>My account</strong>
          </p>
          {isAuthenticated && (
            <button
              onClick={() => handleButtonClick('upload')}
              className='px-3 py-2 hover:bg-slate-100 transition-all ease-in-out duration-300x@xx@ w-11/12 mt-2 rounded-md text-left'
            >
              Settings
            </button>
          )}
          <p className=' transition-all ease-in-out duration-300x@xx@ w-11/12 rounded-md text-left'>
            {isAuthenticated ? <LogoutButton /> : <LoginButton />}
          </p>
        </div>
      </Menu>
    </header>
  );
}
