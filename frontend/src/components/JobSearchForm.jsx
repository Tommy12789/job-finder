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
    <form
      onSubmit={handleSubmit}
      className='p-10 text-slate-800 justify-between flex-1 flex-wrap bg-slate-100'
    >
      <div className='flex gap-10'>
        <div className='flex-1 min-w-[200px]'>
          <label className='block mb-2 text-sm font-medium text-slate-900'>Mots-clés</label>
          <input
            className='bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
            type='text'
            name='keywords'
            value={formData.keywords}
            onChange={handleChange}
          />
        </div>
        <div className='flex-1 min-w-[200px]'>
          <label className='block mb-2 text-sm font-medium text-slate-900'>Localisation</label>
          <input
            className='bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
            type='text'
            name='location'
            value={formData.location}
            onChange={handleChange}
          />
        </div>
        <div className='flex-1 min-w-[400px]'>
          <label className='block mb-2 text-sm font-medium text-slate-900'>
            Niveau d'expérience
          </label>
          <input
            className='bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
            type='text'
            name='experience_level'
            value={formData.experience_level}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className=''>
        <button
          className='text-white bg-slate-400 hover:bg-slate-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center transition-color ease-in-out duration-300'
          type='submit'
        >
          Chercher
        </button>
      </div>
    </form>
  );
}

export default JobSearchForm;
