import React, { useState, useEffect } from 'react';

export default function Settings({ user }) {
  const [resumeText, setResumeText] = useState('Le texte de votre CV apparaîtra ici.');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    zip: '',
    city: '',
    country: '',
  });

  // Récupérer les informations de l'utilisateur au montage du composant
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/get-user-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        // Met à jour les données du formulaire avec les informations récupérées
        setFormData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phoneNumber: data.phoneNumber || '',
          address: data.address || '',
          zip: data.zip || '',
          city: data.city || '',
          country: data.country || '',
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [user.email]); // Le useEffect s'exécute au chargement du composant ou quand l'email change

  const toggleEdit = async () => {
    if (isEditing) {
      await updateUserData(); // Appel à la fonction pour mettre à jour les données
    }
    setIsEditing(!isEditing);
  };

  const updateUserData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/update-user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, ...formData }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user data');
      }

      const data = await response.json();

      console.log('User data updated successfully:', data);
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

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
    <div
      className='flex row'
      style={{ height: 'calc(100vh - 40px)' }}
    >
      <div className='bg-slate-100 w-full h-100 pt-10 pl-10 pb-10 flex'>
        <div className='bg-slate-50 w-full h-max mx-5 rounded-lg shadow-sm border-slate-200 border-2 flex flex-col'>
          <h2 className='text-2xl font-medium py-6 border-b w-full px-10 text-slate-900'>
            {' '}
            Personnal informations{' '}
          </h2>
          <div className='flex flex-1 flex-col p-6 gap-3'>
            <div className='flex gap-3'>
              <input
                placeholder='First name'
                type='text'
                name='firstName'
                value={formData.firstName}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`p-2 bg-slate-100 rounded-lg border border-slate-200 flex-1 ${
                  !isEditing ? 'cursor-not-allowed' : ''
                }`}
              />
              <input
                placeholder='Last name'
                type='text'
                name='lastName'
                value={formData.lastName}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`p-2 bg-slate-100 rounded-lg border border-slate-200 flex-1 ${
                  !isEditing ? 'cursor-not-allowed' : ''
                }`}
              />
            </div>
            <input
              placeholder='Phone number'
              type='text'
              name='phoneNumber'
              value={formData.phoneNumber}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`p-2 bg-slate-100 rounded-lg border border-slate-200 flex-1 ${
                !isEditing ? 'cursor-not-allowed' : ''
              }`}
            />
            <input
              placeholder='Address'
              type='text'
              name='address'
              value={formData.address}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`p-2 bg-slate-100 rounded-lg border border-slate-200 flex-1 ${
                !isEditing ? 'cursor-not-allowed' : ''
              }`}
            />
            <input
              placeholder='Zip code'
              type='text'
              name='zip'
              value={formData.zip}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`p-2 bg-slate-100 rounded-lg border border-slate-200 flex-1 ${
                !isEditing ? 'cursor-not-allowed' : ''
              }`}
            />
            <div className='flex gap-3'>
              <input
                placeholder='City'
                type='text'
                name='city'
                value={formData.city}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`p-2 bg-slate-100 rounded-lg border border-slate-200 flex-1 ${
                  !isEditing ? 'cursor-not-allowed' : ''
                }`}
              />
              <input
                placeholder='Country'
                type='text'
                name='country'
                value={formData.country}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`p-2 bg-slate-100 rounded-lg border border-slate-200 flex-1 ${
                  !isEditing ? 'cursor-not-allowed' : ''
                }`}
              />
            </div>
            <button
              onClick={toggleEdit}
              className={`py-2 px-4 rounded-lg ${
                isEditing ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
              }`}
            >
              {isEditing ? 'Save' : 'Edit'}
            </button>
          </div>
        </div>
      </div>
      <div className='bg-slate-100 h-full w-full pr-10 pt-10 pb-10 flex'>
        <div className='bg-slate-50 w-full h-full mx-5 rounded-lg shadow-sm border-slate-200 border-2 flex flex-col'>
          <h2 className='text-2xl font-medium py-6 border-b w-full px-10 text-slate-900'>
            {' '}
            Document upload{' '}
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
    </div>
  );
}
