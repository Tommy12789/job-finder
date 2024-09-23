import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react'; // Importez useAuth0
import JobSearchForm from './components/JobSearchForm';
import JobOffers from './components/JobOffers';
import LoginButton from './components/LoginButton';
import LogoutButton from './components/LogoutButton';
import Profile from './components/Profile';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

function App() {
  const [jobOffers, setJobOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth0();
  const [selectedSection, setSelectedSection] = useState('search');

  const handleSidebarClick = (section) => {
    setSelectedSection(section);
    console.log(selectedSection);
  };

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

  const renderContent = () => {
    switch (selectedSection) {
      case 'profile':
        return <Profile />;
      case 'search':
        return (
          <div>
            <JobSearchForm onSearch={handleSearch} />
            {loading ? <p>Recherche en cours...</p> : <JobOffers jobOffers={jobOffers} />}
          </div>
        );
      case 'offers':
        return <JobOffers jobOffers={jobOffers} />;
      case 'favorites':
        return <p>favorites</p>;
      default:
        return <Profile />;
    }
  };

  return (
    <div className='flex h-screen w-screen'>
      <Sidebar onSectionClick={handleSidebarClick} />
      <div className='flex flex-1 flex-col space-y'>
        <Header
          onSectionClick={handleSidebarClick}
          isAuthenticated={isAuthenticated}
          selectedSection={selectedSection}
        />
        <div>
          <div>{renderContent()}</div>
        </div>
      </div>
    </div>
  );
}

export default App;
