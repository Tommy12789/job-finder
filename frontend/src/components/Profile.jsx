import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const Profile = () => {
  const { user, isAuthenticated } = useAuth0();

  useEffect(() => {
    const registerUser = async () => {
      if (isAuthenticated) {
        try {
          await fetch('http://127.0.0.1:5000/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
          });
        } catch (error) {
          console.error('Erreur lors de l\'enregistrement de l\'utilisateur :', error);
        }
      }
    };

    registerUser();
  }, [isAuthenticated, user]);

  return (
    isAuthenticated && (
      <div>
        <h2>Bienvenue, {user.name}</h2>
        <img src={user.picture} alt={user.name} />
        <p>Email: {user.email}</p>
      </div>
    )
  );
};

export default Profile;
