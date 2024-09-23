import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react'; // Importez useAuth0
import JobSearchForm from './components/JobSearchForm';
import JobOffers from './components/JobOffers';
import LoginButton from './components/LoginButton';
import LogoutButton from './components/LogoutButton';
import Profile from './components/Profile';
import Sidebar from './components/Sidebar';
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
  const { isAuthenticated } = useAuth0();
  const [selectedSection, setSelectedSection] = useState('search');

  const handleSidebarClick = (section) => {
    setSelectedSection(section);
  };

  function handleFavoriteClick(jobOffer) {
    if (favoriteJobOffers.some((fav) => fav.title === jobOffer.title)) {
      setFavoriteJobOffers((prevFavoriteJobOffers) =>
        prevFavoriteJobOffers.filter((fav) => fav.title !== jobOffer.title)
      );
    } else {
      setFavoriteJobOffers((prevFavoriteJobOffers) => [...prevFavoriteJobOffers, jobOffer]);
    }
  }

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
          <>
            <JobSearchForm onSearch={handleSearch} />
            {loading ? (
              <div className='flex flex-1 items-center'>
                <svg
                  aria-hidden='true'
                  className='fill-slate-700 flex flex-1 items-center  w-24 h-24 text-slate-200 animate-spin'
                  viewBox='0 0 100 101'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
                    fill='currentColor'
                  />
                  <path
                    d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
                    fill='currentFill'
                  />
                </svg>
              </div>
            ) : (
              <JobOffers
                jobOffers={jobOffers}
                handleFavoriteClick={handleFavoriteClick}
                favoriteJobOffers={favoriteJobOffers}
              />
            )}
          </>
        );
      case 'offers':
        return <JobOffers jobOffers={jobOffers} />;
      case 'favorites':
        return (
          <Favorites
            favoriteJobOffers={favoriteJobOffers}
            handleFavoriteClick={handleFavoriteClick}
          />
        );
      case 'settings':
        return <Settings />;
      default:
        return <Profile />;
    }
  };

  return (
    <div className='flex h-screen w-screen overflow-hidden'>
      <Sidebar onSectionClick={handleSidebarClick} />
      <div className='flex flex-1 flex-col space-y max-h-screen'>
        <Header
          onSectionClick={handleSidebarClick}
          isAuthenticated={isAuthenticated}
          selectedSection={selectedSection}
        />
        <div className='flex flex-1 flex-col'>{renderContent()}</div>
      </div>
    </div>
  );
}

export default App;
