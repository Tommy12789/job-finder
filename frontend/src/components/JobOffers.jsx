import React, { useState } from 'react';

function JobOffers({ jobOffers }) {
  const [selectedOffer, setSelectedOffer] = useState(null);

  const handleSelectOffer = (offer) => {
    setSelectedOffer(offer);
  };

  return (
    <div className='flex'>
      {/* Cadre à gauche - Liste des offres */}
      <div className='w-1/3 p-4 bg-slate-100 border-r border-slate-300'>
        <h2 className='text-xl font-semibold text-slate-800 mb-4'>Offres d'emploi</h2>
        <ul className='space-y-4'>
          {jobOffers.map((offer, index) => (
            <li
              key={index}
              className='p-4 bg-white border border-slate-300 rounded-lg shadow-sm cursor-pointer hover:bg-slate-50'
              onClick={() => handleSelectOffer(offer)}
            >
              <h3 className='text-lg font-bold text-slate-900 mb-2'>{offer.title}</h3>
              <p className='text-slate-700 mb-1'>
                <strong>Entreprise:</strong> {offer.company}
              </p>
              <p className='text-slate-700 mb-1'>
                <strong>Localisation:</strong> {offer.location}
              </p>
              <p className='text-slate-700 mb-1'>
                <strong>Date:</strong> {offer.date}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Cadre à droite - Détails de l'offre sélectionnée */}
      <div className='w-2/3 p-4 bg-slate-50'>
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
            <p className='text-slate-600 mt-4'>{selectedOffer.job_description}</p>
          </div>
        ) : (
          <p className='text-slate-700'>Veuillez sélectionner une offre pour voir les détails.</p>
        )}
      </div>
    </div>
  );
}

export default JobOffers;
