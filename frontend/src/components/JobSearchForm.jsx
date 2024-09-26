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
      pages_to_scrape: 1,
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
      className='flex flex-row px-10 py-6 text-slate-800 justify-between w-full'
    >
      <div className='flex gap-5 w-3/4'>
        <div className='w-1/3'>
          <label className='block mb-2 text-sm font-medium text-slate-900'>Keywords</label>
          <input
            className='bg-slate-50  border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
            type='text'
            name='keywords'
            value={formData.keywords}
            onChange={handleChange}
          />
        </div>
        <div className='w-1/3'>
          <label className='block mb-2 text-sm font-medium text-slate-900'>Location</label>
          <input
            className='bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
            type='text'
            name='location'
            value={formData.location}
            onChange={handleChange}
          />
        </div>
        <div className='w-1/3'>
          <label className='block mb-2 text-sm font-medium text-slate-900'>Experience level </label>
          <select
            className='bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
            type='text'
            name='experience_level'
            value={formData.experience_level}
            onChange={handleChange}
          >
            <option value='1'>Intern / Apprentice</option>
            <option value='2'>Junior</option>
            <option value='3'>Intermediate</option>
            <option value='4'>Senior</option>
            <option value='5'>Lead</option>
            <option value='6'>Manager</option>
          </select>
        </div>
      </div>
      <div className=' justify-end pt-5'>
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
