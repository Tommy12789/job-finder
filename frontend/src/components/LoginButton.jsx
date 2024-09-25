import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <button
      onClick={() => loginWithRedirect()}
      className='mt-2 hover:bg-slate-100 w-full h-full py-2 rounded-lg'
    >
      Login {/* Affiche le texte du bouton */}
    </button>
  );
};

export default LoginButton;
