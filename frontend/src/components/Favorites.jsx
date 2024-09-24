import React from 'react';
import FavoriteOutlinedIcon from '@mui/icons-material/FavoriteOutlined';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import { useState } from 'react';
import { Tooltip, Box, Button } from '@mui/material';

export default function Favorites({
  favoriteJobOffers,
  handleFavoriteClick,
  user,
  setFavoriteJobOffers,
}) {
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [descriptionTab, setDescriptionTab] = useState('description');
  const [isLoading, setIsLoading] = useState(false);

  const handleFavoritesClick = (jobOffer) => {
    handleFavoriteClick(jobOffer);
  };

  const handleSelectOffer = (offer) => {
    setSelectedOffer(offer);
    setDescriptionTab('description');
  };

  const handleGenerateCoverLetter = async (jobOffer) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/generate-cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email, // Replace with the actual user's email
          jobOffer: jobOffer,
        }),
      });

      if (!response.ok) {
        throw new Error('Error generating cover letter');
      }

      const data = await response.json();

      // Mise à jour immédiate de l'état
      setFavoriteJobOffers((prev) =>
        prev.map((offer) =>
          offer.title === jobOffer.title ? { ...offer, cover_letter: data.cover_letter } : offer
        )
      );

      // Mise à jour immédiate de l'offre sélectionnée
      setSelectedOffer((prevSelectedOffer) =>
        prevSelectedOffer && prevSelectedOffer.title === jobOffer.title
          ? { ...prevSelectedOffer, cover_letter: data.cover_letter }
          : prevSelectedOffer
      );
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!selectedOffer || !selectedOffer.cover_letter) {
      console.error('No cover letter available to download');
      return;
    }

    const link = document.createElement('a');
    const blob = new Blob([selectedOffer.cover_letter], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = 'cover_letter.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className='flex flex-1'>
      {/* Left panel - Favorites list */}
      <div className='w-2/5 border-slate-300 flex flex-col'>
        <h2 className='text-xl font-semibold mb-4 mt-4 text-center'>
          {favoriteJobOffers.length > 0
            ? `You have ${favoriteJobOffers.length} offer${
                favoriteJobOffers.length > 1 ? 's' : ''
              } in favorites`
            : "You don't have any favorite offers"}
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
              <p className='flex gap-2 items-center mb-2'>
                <img
                  className='w-9 h-9 rounded-full border'
                  src={offer.company_logo}
                  alt=''
                />
                <h3 className='text-lg font-bold text-slate-900 pr-10'>{offer.title}</h3>
              </p>
              <p className='text-slate-700 mb-1'>{offer.company}</p>
              <p className='text-slate-400 mb-1'>{offer.location}</p>
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

      {/* Right panel - Selected offer details */}
      <div className='w-3/5 h-full overflow-y-auto'>
        {selectedOffer ? (
          <>
            <div className='border-b p-4'>
              <p className='flex gap-4 items-center mb-4'>
                <img
                  className='rounded-full border w-16 h-16'
                  src={selectedOffer.company_logo}
                  alt=''
                />
                <div className='flex pr-20 row justify-between w-100%'>
                  <h2 className='text-2xl font-semibold text-slate-800'>{selectedOffer.title}</h2>
                </div>
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
            <div className='flex w-full p-3 justify-center gap-2 text-slate-700 font-medium'>
              <div className='w-full flex p-3 gap-2 bg-slate-100 rounded-lg'>
                <button
                  className={`w-1/2 p-2 rounded-md hover:bg-slate-300 transition-all ease-in-out duration-300 ${
                    descriptionTab === 'description' ? 'bg-slate-300 text-slate-900' : ''
                  }`}
                  onClick={() => setDescriptionTab('description')}
                >
                  Description
                </button>
                <button
                  className={`w-1/2 p-2 rounded-md hover:bg-slate-300 transition-all ease-in-out duration-300 ${
                    descriptionTab === 'coverLetter' ? 'bg-slate-300 text-slate-900' : ''
                  }`}
                  onClick={() => setDescriptionTab('coverLetter')}
                >
                  Cover Letter
                </button>
              </div>
            </div>
            <p
              className='text-slate-600 p-5 overflow-y-auto'
              style={{ height: 'calc(100vh - 385px)' }}
            >
              {descriptionTab === 'description' &&
              selectedOffer &&
              selectedOffer.job_description ? (
                <span
                  dangerouslySetInnerHTML={{
                    __html: selectedOffer.job_description.replace(/\n/g, '<br />'),
                  }}
                ></span>
              ) : descriptionTab === 'coverLetter' && selectedOffer.cover_letter ? (
                <textarea
                  className='w-full h-full p-4 bg-slate-100 rounded-lg'
                  defaultValue={selectedOffer.cover_letter}
                ></textarea>
              ) : descriptionTab === 'coverLetter' && !selectedOffer.cover_letter ? (
                <div className='flex justify-center items-center h-full'>
                  {isLoading ? (
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
                    <button
                      className='bg-slate-50 p-3 rounded-lg border text-slate-600 hover:bg-slate-200 transition-all ease-in-out duration-300'
                      onClick={() => handleGenerateCoverLetter(selectedOffer)}
                      disabled={isLoading}
                    >
                      Generate Cover Letter
                    </button>
                  )}
                </div>
              ) : (
                'No content available'
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
