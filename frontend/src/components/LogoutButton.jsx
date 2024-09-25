import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const LogoutButton = () => {
  const { logout } = useAuth0();

  return (
    <button
      className='mt-2 hover:bg-slate-100 w-full h-full py-2 flex pl-3 rounded-lg'
      onClick={() => logout({ returnTo: window.location.origin })}
    >
      Logout
    </button>
  );
};

export default LogoutButton;
