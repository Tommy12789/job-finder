import React, { useState, useEffect } from 'react';

export default function Settings({ user }) {
  const [resumeText, setResumeText] = useState('Le texte de votre CV apparaîtra ici.');

  // Fetch existing resume text when component mounts
  useEffect(() => {
    const fetchResumeText = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/get-resume-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch resume text');
        }

        const data = await response.json();
        setResumeText(data.resume_text || 'Le texte de votre CV apparaîtra ici.');
      } catch (error) {
        console.error(error);
        setResumeText('Erreur lors de la récupération du texte du CV.');
      }
    };

    fetchResumeText();
  }, [user.email]);

  const handleFileChange = async (file) => {
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('email', user.email);

      const response = await fetch('http://127.0.0.1:5000/resume-upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error uploading file');
      }

      const data = await response.json();
      setResumeText(data.text || 'No text extracted from the resume.');
    } catch (error) {
      console.error(error);
      setResumeText('Failed to upload or extract text from the file.');
    }
  };

  return (
    <div className='bg-slate-100 h-full w-full p-10 flex'>
      <div className='bg-slate-50 w-full h-full mx-5 rounded-lg shadow-sm border-slate-200 border-2 flex flex-col'>
        <h2 className='text-2xl font-medium py-6 border-b w-full px-10 text-slate-900'>
          Document upload
        </h2>
        <div className='flex flex-1 flex-col p-6 gap-3'>
          <label
            htmlFor='file'
            className='py-6 px-10 w-full flex flex-col items-center justify-center gap-3 border-dashed border-2 rounded-xl cursor-pointer'
          >
            <span>Upload your Resume here or paste text below</span>
            <input
              onChange={(e) => handleFileChange(e.target.files[0])}
              type='file'
              id='file'
              className='hidden'
              accept='.pdf'
            />
          </label>
          <label
            htmlFor='text'
            className='font-medium text-slate-900'
          >
            Here is what we have for your resume:
          </label>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)} // Allow user to edit text
            placeholder='Resume text'
            className='p-4 bg-slate-100 rounded-lg border border-slate-200 h-full'
          />
        </div>
      </div>
    </div>
  );
}
