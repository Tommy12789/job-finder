import React from 'react';

function JobOffers({ jobOffers }) {
  if (!jobOffers || jobOffers.length === 0) {
    return <p>Aucune offre d'emploi disponible.</p>;
  }

  return (
    <div>
      <h2>Offres d'emploi</h2>
      <ul>
        {jobOffers.map((offer, index) => (
          <li key={index}>
            <h3>{offer.title}</h3>
            <p>Entreprise: {offer.company}</p>
            <p>Localisation: {offer.location}</p>
            <p>Date: {offer.date}</p>
            <a
              href={offer.job_url}
              target='_blank'
              rel='noopener noreferrer'
            >
              Voir l'offre
            </a>
            <p>Description : {offer.job_description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default JobOffers;
