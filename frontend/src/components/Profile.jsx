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
          console.error("Erreur lors de l'enregistrement de l'utilisateur :", error);
        }
      }
    };

    registerUser();
  }, [isAuthenticated, user]);

  return (
    isAuthenticated && (
      <div className='flex flex-col items-center gap-3 pt-2 pb-3 px-4 border-b '>
        <h2 className='text-l'>
          Bienvenue, <strong> {user.name}</strong>
        </h2>
        <img
          className='rounded-full border-2 border-slate-200'
          src={user.picture}
          alt={user.name}
        />
      </div>
    )
  );
};

export default Profile;
