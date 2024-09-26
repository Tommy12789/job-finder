import React, { useState } from 'react';
import ReactDOM from 'react-dom';

export default function JobCreationModal({ isOpen, onClose, onSubmit }) {
  const [jobUrl, setJobUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setJobUrl(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSubmit(jobUrl);
    onClose();
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50'>
      <div className='bg-white p-8 rounded-lg shadow-xl w-[600px] max-h-[90vh] overflow-y-auto'>
        <h2 className='text-2xl font-bold mb-4'>Add New Job</h2>
        <form onSubmit={handleSubmit}>
          <div className='mb-4'>
            <label
              htmlFor='job_url'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Job Offer URL:
            </label>
            <input
              type='url'
              id='job_url'
              name='job_url'
              value={jobUrl}
              onChange={handleChange}
              required
              className='w-full p-2 border rounded'
              placeholder='https://example.com/job-offer'
            />
          </div>
          {error && <p className='text-red-500 mb-4'>{error}</p>}
          <div className='flex justify-end gap-4'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 bg-slate-50 text-slate-700 rounded hover:bg-slate-200 border-2'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='mr-2 px-4 py-2 bg-slate-300 text-slate-800 rounded hover:bg-slate-400'
            >
              Add Job
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.getElementById('root')
  );
}
