import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react'; // Importez useAuth0
import JobSearchForm from './components/JobSearchForm';
import JobOffers from './components/JobOffers';
import LoginButton from './components/LoginButton';
import LogoutButton from './components/LogoutButton';
import Profile from './components/Profile';

function App() {
  const [jobOffers, setJobOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth0(); 

  const handleSearch = async (config) => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || 'Une erreur est survenue');
      }

      const data = await response.json();
      setJobOffers(data);
    } catch (error) {
      console.error('Erreur lors de la requête :', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Moteur de recherche d'emploi</h1>
      {!isAuthenticated ? (
        <div>
          <LoginButton /> {}
        </div>
      ) : (
        <div>
          <LogoutButton /> {}
          <Profile /> {}
          <JobSearchForm onSearch={handleSearch} />
          {loading ? <p>Recherche en cours...</p> : <JobOffers jobOffers={jobOffers} />}
        </div>
      )}
    </div>
  );
}

export default App;
