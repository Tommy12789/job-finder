import React from 'react';
import FavoriteOutlinedIcon from '@mui/icons-material/FavoriteOutlined';
import { useState } from 'react';
import Tooltip from '@mui/material/Tooltip';

export default function Favorites({ favoriteJobOffers, handleFavoriteClick }) {
  const [selectedOffer, setSelectedOffer] = useState(null);

  const handleFavoritesClick = (jobOffer) => {
    handleFavoriteClick(jobOffer);
  };

  const handleSelectOffer = (offer) => {
    setSelectedOffer(offer);
  };

  return (
    <div className='flex flex-1'>
      {/* Cadre à gauche - Liste des favoris */}
      <div className='w-2/5 border-slate-300 flex flex-col'>
        <h2 className='text-xl font-semibold mb-4 mt-4 text-center'>
          {favoriteJobOffers.length > 0
            ? `Vous avez ${favoriteJobOffers.length} offre${
                favoriteJobOffers.length > 1 ? 's' : ''
              } en favori`
            : "Vous n'avez pas encore d'offres en favori"}
        </h2>
        <ul
          className='overflow-y-auto'
          style={{ height: 'calc(100vh - 118px)' }}
        >
          {favoriteJobOffers.map((offer, index) => (
            <li
              key={index}
              className={`p-4 shadow-sm cursor-pointer hover:bg-slate-100 relative ${
                selectedOffer === offer ? 'bg-slate-100 border-l-2 border-slate-900' : ''
              }`}
              onClick={() => handleSelectOffer(offer)}
            >
              <h3 className='text-lg font-bold text-slate-900 mb-2 pr-10'>{offer.title}</h3>
              <p className='text-slate-700 mb-1'>
                <strong>Entreprise:</strong> {offer.company}
              </p>
              <p className='text-slate-700 mb-1'>
                <strong>Localisation:</strong> {offer.location}
              </p>
              <p className='text-slate-700 mb-1'>
                <strong>Date:</strong> {offer.date}
              </p>
              <Tooltip
                title='Unlike'
                placement='bottom-start'
                componentsProps={{
                  tooltip: {
                    sx: {
                      fontWeight: '400',
                      bgcolor: '#f8fafc',
                      color: '#0f172a',
                      padding: '4px 10px',
                      fontSize: '14px',
                      borderRadius: '8px',
                      border: 'solid #e2e8f0',
                      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                    },
                  },
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFavoritesClick(offer);
                  }}
                  className='absolute top-4 right-4 bg-slate-50 p-2 rounded-lg border text-slate-600 hover:bg-slate-200 transition-all ease-in-out duration-300'
                >
                  <FavoriteOutlinedIcon />
                </button>
              </Tooltip>
            </li>
          ))}
        </ul>
      </div>

      {/* Cadre à droite - Détails de l'offre sélectionnée */}
      <div className='w-3/5 p-4 h-full overflow-y-auto'>
        {selectedOffer ? (
          <div>
            <h2 className='text-2xl font-semibold text-slate-800 mb-4'>{selectedOffer.title}</h2>
            <p className='text-slate-700 mb-2'>
              <strong>Entreprise:</strong> {selectedOffer.company}
            </p>
            <p className='text-slate-700 mb-2'>
              <strong>Localisation:</strong> {selectedOffer.location}
            </p>
            <p className='text-slate-700 mb-2'>
              <strong>Date:</strong> {selectedOffer.date}
            </p>
            <p className='text-slate-700 mb-2'>
              <strong>URL de l'offre:</strong>{' '}
              <a
                href={selectedOffer.job_url}
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-600 hover:text-blue-800'
              >
                {selectedOffer.job_url}
              </a>
            </p>
            <p
              className='text-slate-600 mt-4 p-4 overflow-y-auto'
              style={{ height: 'calc(100vh - 256px)' }}
            >
              {selectedOffer && selectedOffer.job_description ? (
                <span
                  dangerouslySetInnerHTML={{
                    __html: selectedOffer.job_description.replace(/\n/g, '<br />'),
                  }}
                ></span>
              ) : (
                'Aucune description disponible'
              )}
            </p>
          </div>
        ) : (
          <p className='text-slate-700'>Veuillez sélectionner une offre pour voir les détails.</p>
        )}
      </div>
    </div>
  );
}
