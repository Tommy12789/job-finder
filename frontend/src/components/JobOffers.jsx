import React, { useState } from 'react';

function JobOffers({ jobOffers }) {
  const [selectedOffer, setSelectedOffer] = useState(null);

  const handleSelectOffer = (offer) => {
    setSelectedOffer(offer);
  };

  return (
    <div className='flex flex-1'>
      {/* Cadre à gauche - Liste des offres */}
      <div className='w-2/5 border-r border-slate-300'>
      <h2 className='text-xl font-semibold mb-4 mt-4 text-center'>
        {jobOffers.length > 0 
          ? `${jobOffers.length} offre${jobOffers.length > 1 ? 's' : ''} d'emploi trouvé${jobOffers.length > 1 ? 's' : ''}` 
          : "Aucune offre d'emploi trouvée"}
      </h2>        
      <ul className='max-h-[400px] overflow-y-auto'>
          {jobOffers.map((offer, index) => (
            <li
              key={index}
              className={`p-4 shadow-sm cursor-pointer hover:bg-slate-100 ${
                selectedOffer === offer ? 'bg-slate-100 border-l-2 border-slate-900' : ''
              }`}
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
      <div className='w-3/5 p-4'>
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
            <p className='text-slate-600 mt-4 p-4 max-h-[800px] overflow-y-auto'>
              {selectedOffer && selectedOffer.job_description ? (
                <span dangerouslySetInnerHTML={{ __html: selectedOffer.job_description.replace(/\n/g, '<br />') }}></span>
              ) : (
                'No description available'
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

export default JobOffers;
