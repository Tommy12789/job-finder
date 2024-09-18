import React, { useState } from 'react';
import JobSearchForm from './components/JobSearchForm';
import JobOffers from './components/JobOffers';

function App() {
  const [jobOffers, setJobOffers] = useState([]);
  const [loading, setLoading] = useState(false);

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

      // Vérifie que la réponse est au format JSON avant de la parser
      if (!response.ok) {
        const errorMessage = await response.text(); // Récupérer le message d'erreur
        throw new Error(errorMessage || 'Une erreur est survenue');
      }

      const data = await response.json(); // Cela ne doit être fait que si la réponse est valide
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
      <JobSearchForm onSearch={handleSearch} />
      {loading ? <p>Recherche en cours...</p> : <JobOffers jobOffers={jobOffers} />}
    </div>
  );
}

export default App;
