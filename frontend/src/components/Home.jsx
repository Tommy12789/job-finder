import React, { useState, useEffect } from 'react';
import LoginButton from './LoginButton';
import { useAuth0 } from '@auth0/auth0-react';

export default function Home({ handleButtonClick }) {
  const { isAuthenticated } = useAuth0();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300); // Délai légèrement plus long pour laisser le temps à la Sidebar et au Header d'apparaître
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`flex-1 flex items-center justify-center py-10 transition-opacity duration-500 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className={`flex flex-col p-10 gap-8 max-w-3xl mx-auto bg-gray-50 rounded-lg shadow-lg h-[80vh] overflow-y-auto transform transition-all duration-500 ${
        isVisible ? 'translate-y-0' : 'translate-y-10'
      }`}>
        <h2 className='text-3xl font-semibold text-gray-800'>Job Finder</h2>
        <p className='text-lg text-gray-700'>
          Welcome to Job Finder, the ultimate web app designed to simplify your job search and
          application process.
        </p>

        <h3 className='text-2xl font-semibold text-gray-800 mt-8'>Features</h3>
        <ul className='list-disc pl-5 text-gray-700'>
          <li>
            <strong className='font-medium'>Advanced Search:</strong> Find jobs using detailed
            filters.
          </li>
          <li>
            <strong className='font-medium'>Favorites:</strong> Save your favorite job offers for
            quick access.
          </li>
          <li>
            <strong className='font-medium'>Cover Letter Generator:</strong> Create personalized
            cover letters in just a few clicks.
          </li>
          <li>
            <strong className='font-medium'>Application Tracker:</strong> Monitor the status of your
            job applications.
          </li>
        </ul>
        <h3 className='text-xl font-semibold text-gray-800 mt-6'>Important</h3>
        <p className='text-lg text-gray-700'>
          To access the <strong>Cover Letter Generator</strong> in your favorites, make sure to fill
          in your personal information and upload your CV in the{' '}
          <strong>Personal Informations</strong> section.
        </p>
        <p className='text-lg text-gray-700 mt-6'>
          Get started now and take control of your job search!
        </p>
        <h3 className='text-2xl font-semibold text-gray-800 mt-8'>How Search Works</h3>
        <p className='text-lg text-gray-700'>
          Our search process is designed to provide you with the most relevant and up-to-date job offers:
        </p>
        <ul className='list-disc pl-5 text-gray-700'>
          <li>When you initiate a search, we query multiple job boards and sources in real-time.</li>
          <li>Job offers are fetched and displayed one by one as they become available.</li>
          <li>This approach ensures you see the latest opportunities as soon as they're found.</li>
          <li>Keep an eye on the results as they populate - new offers may appear at any time during your search session!</li>
        </ul>
        <h3 className='text-2xl font-semibold text-gray-800 mt-8'>Manual Job Addition</h3>
        <p className='text-lg text-gray-700'>
          In addition to our automatic search, you can manually add job offers:
        </p>
        <ul className='list-disc pl-5 text-gray-700'>
          <li>Use the "Add Job" button to manually input job details.</li>
          <li>Paste a LinkedIn or Workday job link to automatically fill in most information.</li>
          <li>For other job sources, you can manually enter all the necessary details.</li>
          <li>This feature allows you to include opportunities from various sources in your job search process.</li>
        </ul>

        {isAuthenticated ? (
          <button
            onClick={() => handleButtonClick('search')}
            className='bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300'
          >
            Start Searching
          </button>
        ) : (
          <LoginButton
            className='bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300'
            buttonText='Get login !'
          />
        )}
      </div>
    </div>
  );
}
