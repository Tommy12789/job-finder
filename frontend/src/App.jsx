import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import JobSearchForm from './components/JobSearchForm';
import JobOffers from './components/JobOffers';
import LoginButton from './components/LoginButton';
import LogoutButton from './components/LogoutButton';
import Profile from './components/Profile';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import Header from './components/Header';
import Settings from './components/Settings';
import Favorites from './components/Favorites';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

function App() {
  const [jobOffers, setJobOffers] = useState([]);
  const [favoriteJobOffers, setFavoriteJobOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useAuth0();
  const [selectedSection, setSelectedSection] = useState('home');
  const [activeButton, setActiveButton] = useState('home');
  const [isSearching, setIsSearching] = useState(false);

  const handleButtonClick = (section) => {
    setActiveButton(section);
    handleSidebarClick(section);
  };

  async function fetchFavorites(email) {
    try {
      const response = await fetch('http://127.0.0.1:5000/get-favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || 'Erreur lors de la récupération des favoris');
      }

      const data = await response.json();
      setFavoriteJobOffers(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des favoris :', error);
    }
  }

  useEffect(() => {
    if (isAuthenticated && user && user.email) {
      fetchFavorites(user.email);
    }
  }, [isAuthenticated, user]);

  const handleSidebarClick = (section) => {
    setSelectedSection(section);
  };

  async function handleFavoriteClick(jobOffer) {
    console.log(user);
    if (!user || !user.email) {
      console.error('Utilisateur non authentifié ou email manquant');
      return;
    }

    const isFavorited = favoriteJobOffers.some((fav) => fav.job_url === jobOffer.job_url);

    try {
      const requestBody = {
        jobOffer,
        email: user.email,
      };

      const response = await fetch(
        isFavorited
          ? 'http://127.0.0.1:5000/remove-favorite'
          : 'http://127.0.0.1:5000/add-favorite',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || 'Erreur lors de la mise à jour des favoris');
      }

      setFavoriteJobOffers((prevFavoriteJobOffers) =>
        isFavorited
          ? prevFavoriteJobOffers.filter((fav) => fav.job_url !== jobOffer.job_url)
          : [...prevFavoriteJobOffers, jobOffer]
      );

      console.log('Mise à jour réussie des favoris dans le backend');
    } catch (error) {
      console.error('Erreur lors de la mise à jour des favoris :', error);
    }
  }

  const handleSearch = async (config) => {
    setJobOffers([]);
    setIsSearching(true);
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

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const jobs = chunk.split('\n').filter(Boolean).map(JSON.parse);
        setJobOffers(prevOffers => [...prevOffers, ...jobs]);
      }
    } catch (error) {
      console.error('Erreur lors de la requête :', error);
    } finally {
      setIsSearching(false);
    }
  };

  const renderContent = () => {
    switch (selectedSection) {
      case 'profile':
        return <Profile />;
      case 'search':
        return (
          <>
            <JobSearchForm onSearch={handleSearch} />
            <JobOffers
              jobOffers={jobOffers}
              handleFavoriteClick={handleFavoriteClick}
              favoriteJobOffers={favoriteJobOffers}
              isSearching={isSearching}
            />
          </>
        );
      case 'offers':
        return <JobOffers jobOffers={jobOffers} />;
      case 'favorites':
        return (
          <Favorites
            user={user}
            favoriteJobOffers={favoriteJobOffers}
            handleFavoriteClick={handleFavoriteClick}
            setFavoriteJobOffers={setFavoriteJobOffers}
          />
        );
      case 'upload':
        return <Settings user={user} />;
      case 'home':
        return <Home handleButtonClick={handleButtonClick} />;
      default:
        return <Profile />;
    }
  };

  return (
    <div className='flex h-screen w-screen overflow-hidden'>
      <Sidebar
        activeButton={activeButton}
        handleButtonClick={handleButtonClick}
      />
      <div className='flex flex-1 flex-col space-y max-h-screen'>
        <Header
          handleButtonClick={handleButtonClick}
          isAuthenticated={isAuthenticated}
          selectedSection={selectedSection}
        />
        <div className='flex flex-1 flex-col'>{renderContent()}</div>
      </div>
    </div>
  );
}

export default App;
