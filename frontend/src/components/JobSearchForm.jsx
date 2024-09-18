import React, { useState } from 'react';

function JobSearchForm({ onSearch }) {
  const [formData, setFormData] = useState({
    keywords: '',
    location: '',
    experience_level: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const config = {
      proxies: {},
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
      },
      pages_to_scrape: 10,
      timespan: 'r86400',
      search_queries: [
        {
          keywords: formData.keywords,
          location: formData.location,
          experience_level: formData.experience_level,
        },
      ],
    };
    onSearch(config);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Mots-clés</label>
        <input
          type='text'
          name='keywords'
          value={formData.keywords}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Localisation</label>
        <input
          type='text'
          name='location'
          value={formData.location}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Niveau d'expérience</label>
        <input
          type='text'
          name='experience_level'
          value={formData.experience_level}
          onChange={handleChange}
        />
      </div>
      <button type='submit'>Chercher</button>
    </form>
  );
}

export default JobSearchForm;
