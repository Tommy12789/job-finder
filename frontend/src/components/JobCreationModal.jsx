import React, { useState } from 'react';
import ReactDOM from 'react-dom';

export default function JobCreationModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    jobUrl: '',
    jobDescription: '', // Add this new field
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50'>
      <div className='bg-white p-8 rounded-lg shadow-xl w-[600px] max-h-[90vh] overflow-y-auto'>
        {' '}
        {/* Modifié ici */}
        <h2 className='text-2xl font-bold mb-4'>Add New Job</h2>
        <form onSubmit={handleSubmit}>
          <input
            type='text'
            name='title'
            value={formData.title}
            onChange={handleChange}
            placeholder='Job Title'
            className='w-full p-2 mb-4 border rounded'
            required
          />
          <div className='flex gap-4 mb-4'>
            {' '}
            {/* Nouveau conteneur flex */}
            <input
              type='text'
              name='company'
              value={formData.company}
              onChange={handleChange}
              placeholder='Company'
              className='w-1/2 p-2 border rounded'
              required
            />
            <input
              type='text'
              name='location'
              value={formData.location}
              onChange={handleChange}
              placeholder='Location'
              className='w-1/2 p-2 border rounded'
              required
            />
          </div>
          <input
            type='url'
            name='jobUrl'
            value={formData.jobUrl}
            onChange={handleChange}
            placeholder='Job URL'
            className='w-full p-2 mb-4 border rounded'
            required
          />
          <textarea
            name='jobDescription'
            value={formData.jobDescription}
            onChange={handleChange}
            placeholder='Job Description'
            className='w-full p-2 mb-4 border rounded h-40'
            required
          />
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
    document.getElementById('modal-root') // Make sure there's a div with id="root" in your index.html
  );
}
