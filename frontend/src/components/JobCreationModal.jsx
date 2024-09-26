import React, { useState } from 'react';
import ReactDOM from 'react-dom';

export default function JobCreationModal({ isOpen, onClose, onSubmit, onSubmitManual }) {
  const [jobUrl, setJobUrl] = useState('');
  const [manualJobData, setManualJobData] = useState({
    title: '',
    company: '',
    location: '',
    jobUrl: '',
    jobDescription: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTab, setSelectedTab] = useState('link');

  const handleChange = (e) => {
    if (selectedTab === 'link') {
      setJobUrl(e.target.value);
    } else {
      setManualJobData({ ...manualJobData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      if (selectedTab === 'link') {
        await onSubmit(jobUrl);
      } else {
        await onSubmitManual(manualJobData);
      }
      setJobUrl('');
      setManualJobData({ title: '', company: '', location: '', jobUrl: '', jobDescription: '' });
      onClose();
    } catch (error) {
      setError('Failed to add job offer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50'>
      <div className='bg-white p-8 rounded-lg shadow-xl w-[600px] max-h-[90vh] overflow-y-auto'>
        <h2 className='text-2xl font-bold mb-4'>Add New Job</h2>
        <div className='flex items-center justify-center w-full bg-slate-200 p-2 rounded-lg gap-2 mb-4'>
          <button 
            className={`w-1/2 py-2 rounded-lg transition-all ease-in-out duration-300 ${
              selectedTab === 'link' 
                ? 'bg-slate-50 text-slate-900 border-2 border-slate-800' 
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
            onClick={() => setSelectedTab('link')}
          >
            With Link
          </button>
          <button 
            className={`w-1/2 py-2 rounded-lg transition-all ease-in-out duration-300 ${
              selectedTab === 'manual' 
                ? 'bg-slate-50 text-slate-900 border-2 border-slate-800' 
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
            onClick={() => setSelectedTab('manual')}
          >
            Manually
          </button>
        </div>
        <form className='p-2' onSubmit={handleSubmit}>
          {selectedTab === 'link' ? (
            <div className='mb-4'>
              <label htmlFor='job_url' className='block text-sm font-medium text-gray-700 mb-1'>
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
          ) : (
            <>
              <div className='mb-4'>
                <label htmlFor='title' className='block text-sm font-medium text-gray-700 mb-1'>
                  Job Title:
                </label>
                <input
                  type='text'
                  id='title'
                  name='title'
                  value={manualJobData.title}
                  onChange={handleChange}
                  required
                  className='w-full p-2 border rounded'
                  placeholder='Software Engineer'
                />
              </div>
              <div className='mb-4'>
                <label htmlFor='company' className='block text-sm font-medium text-gray-700 mb-1'>
                  Company:
                </label>
                <input
                  type='text'
                  id='company'
                  name='company'
                  value={manualJobData.company}
                  onChange={handleChange}
                  required
                  className='w-full p-2 border rounded'
                  placeholder='Acme Inc.'
                />
              </div>
              <div className='mb-4'>
                <label htmlFor='location' className='block text-sm font-medium text-gray-700 mb-1'>
                  Location:
                </label>
                <input
                  type='text'
                  id='location'
                  name='location'
                  value={manualJobData.location}
                  onChange={handleChange}
                  required
                  className='w-full p-2 border rounded'
                  placeholder='New York, NY'
                />
              </div>
              <div className='mb-4'>
                <label htmlFor='jobUrl' className='block text-sm font-medium text-gray-700 mb-1'>
                  Job URL:
                </label>
                <input
                  type='url'
                  id='jobUrl'
                  name='jobUrl'
                  value={manualJobData.jobUrl}
                  onChange={handleChange}
                  required
                  className='w-full p-2 border rounded'
                  placeholder='https://example.com/job-offer'
                />
              </div>
              <div className='mb-4'>
                <label htmlFor='jobDescription' className='block text-sm font-medium text-gray-700 mb-1'>
                  Job Description:
                </label>
                <textarea
                  id='jobDescription'
                  name='jobDescription'
                  value={manualJobData.jobDescription}
                  onChange={handleChange}
                  required
                  className='w-full p-2 border rounded h-32'
                  placeholder='Enter job description here...'
                />
              </div>
            </>
          )}
          {error && <p className='text-red-500 mb-4'>{error}</p>}
          <div className='flex justify-end gap-4'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 bg-slate-50 text-slate-700 rounded hover:bg-slate-200 border-2'
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : 'Add Job'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.getElementById('root')
  );
}
