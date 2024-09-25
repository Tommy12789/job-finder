import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const LoginButton = ({ className = '', buttonText = 'Login' }) => {
  const { loginWithRedirect } = useAuth0();

  return (
    <button
      onClick={() => loginWithRedirect()}
      className={className}
    >
      {buttonText} {/* Affiche le texte du bouton */}
    </button>
  );
};

export default LoginButton;
