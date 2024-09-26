import React, { useState } from 'react';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import FavoriteOutlinedIcon from '@mui/icons-material/FavoriteOutlined';
import Tooltip from '@mui/material/Tooltip';

function JobOffers({ jobOffers, handleFavoriteClick, favoriteJobOffers }) {
  const [selectedOffer, setSelectedOffer] = useState(null);

  const handleSelectOffer = (offer) => {
    setSelectedOffer(offer);
  };

  const handleFavoritesClick = (jobOffer) => {
    handleFavoriteClick(jobOffer);
  };

  const isFavorite = (offer) => {
    return favoriteJobOffers.some((fav) => fav.job_url === offer.job_url);
  };

  return (
    <div className='flex flex-1'>
      {/* Left panel - Job offers list */}
      <div className='w-2/5 border-slate-300 flex flex-col'>
        <h2 className='p-4 text-xl font-semibold  text-center border-b'>
          {jobOffers.length > 0
            ? `${jobOffers.length} job offer${jobOffers.length > 1 ? 's' : ''} found`
            : 'No job offers found'}
        </h2>
        <ul
          className='overflow-y-auto'
          style={{ height: 'calc(100vh - 235px)' }}
        >
          {jobOffers.map((offer, index) => (
            <li
              key={index}
              className={`p-4 shadow-sm cursor-pointer hover:bg-slate-100 relative ${
                selectedOffer === offer ? 'bg-slate-100 border-l-2 border-slate-900' : ''
              }`}
              onClick={() => handleSelectOffer(offer)}
            >
              <p className='flex gap-2 items-center mb-2'>
                <img
                  className='w-9 h-9 rounded-full border '
                  src={offer.company_logo}
                  alt=''
                />
                <h3 className='text-lg font-bold text-slate-900  pr-10'>{offer.title}</h3>
              </p>
              <p className='text-slate-700 mb-1'>{offer.company}</p>
              <p className='text-slate-400 mb-1'>{offer.location}</p>
              <Tooltip
                title={isFavorite(offer) ? 'Unlike' : 'Like'}
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
                  {isFavorite(offer) ? <FavoriteOutlinedIcon /> : <FavoriteBorderOutlinedIcon />}
                </button>
              </Tooltip>
            </li>
          ))}
        </ul>
      </div>

      <div className='flex flex-1 flex-col w-3/5 h-full overflow-y-auto '>
        {selectedOffer ? (
          <>
            <div className='border-b p-4'>
              <p className='flex gap-4 items-center mb-4'>
                <img
                  className='rounded-full border w-16 h-16'
                  src={selectedOffer.company_logo}
                  alt=''
                />
                <h2 className='text-2xl font-semibold text-slate-800 '>{selectedOffer.title}</h2>
              </p>
              <p className='text-slate-700 mb-2'>
                <strong>Company:</strong> {selectedOffer.company}
              </p>
              <p className='text-slate-700 mb-2'>
                <strong>Location:</strong> {selectedOffer.location}
              </p>
              <p className='text-slate-700 mb-2'>
                <strong>Date:</strong> {selectedOffer.date}
              </p>
              <p className='text-slate-700 mb-2'>
                <strong>Job URL:</strong>{' '}
                <a
                  href={selectedOffer.job_url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-600 hover:text-blue-800'
                >
                  {selectedOffer.job_url}
                </a>
              </p>
            </div>
            <p
              className='text-slate-600 p-6 overflow-y-auto'
              style={{ height: 'calc(100vh - 375px)' }}
            >
              {selectedOffer && selectedOffer.job_description ? (
                <span
                  dangerouslySetInnerHTML={{
                    __html: selectedOffer.job_description.replace(/\n/g, '<br />'),
                  }}
                ></span>
              ) : (
                'No description available'
              )}
            </p>
          </>
        ) : (
          <p className='flex items-center justify-center text-slate-700 text-xl h-full w-full '>
            Please select an offer to view the details.
          </p>
        )}
      </div>
    </div>
  );
}

export default JobOffers;
