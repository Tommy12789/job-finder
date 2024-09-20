import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useState } from 'react';
import Profile from './Profile';
import LoginButton from './LoginButton';
import LogoutButton from './LogoutButton';

export default function Header({ selectedSection, isAuthenticated }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  function Capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const renderProfileLogo = () => {
    if (isAuthenticated) {
      return (
        <button
          onClick={handleClick}
          className='flex items-center rounded-full bg-slate-50 p-2 border hover:shadow-inner transition-all ease-in-out duration-300'
        >
          <PersonRoundedIcon className='text-slate-900' />
        </button>
      );
    } else {
      return (
        <button
          onClick={handleClick}
          className='flex items-center rounded-full bg-slate-50 p-2 border hover:shadow-inner transition-all ease-in-out duration-300'
        >
          <PersonRoundedIcon className='text-slate-900' />
        </button>
      );
    }
  };

  return (
    <header className='bg-slate-50 w-full py-4 flex items-center justify-between px-10 text-slate-700'>
      <p>{Capitalize(selectedSection)}</p>
      {renderProfileLogo()}
      <Menu
        id='basic-menu'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        {isAuthenticated && <Profile />}
        <MenuItem onClick={handleClose}>My account</MenuItem>
        <MenuItem onClick={handleClose}>
          {isAuthenticated ? <LogoutButton /> : <LoginButton />}
        </MenuItem>
      </Menu>
    </header>
  );
}
