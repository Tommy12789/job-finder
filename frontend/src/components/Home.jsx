import React from 'react';
import LoginButton from './LoginButton';
import { useAuth0 } from '@auth0/auth0-react';

export default function Home({ onSectionClick }) {
  const { isAuthenticated } = useAuth0();

  return (
    <div className='flex flex-col p-10 gap-8 max-w-3xl mx-auto bg-gray-50 rounded-lg shadow-lg justify-center h-full my-52'>
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
          <strong className='font-medium'>Cover Letter Generator:</strong> Create personalized cover
          letters in just a few clicks.
        </li>
        <li>
          <strong className='font-medium'>Application Tracker:</strong> Monitor the status of your
          job applications.
        </li>
      </ul>

      <p className='text-lg text-gray-700 mt-6'>
        Get started now and take control of your job search!
      </p>
      {isAuthenticated ? (
        <button
          onClick={() => onSectionClick('search')}
          className='bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300'
        >
          Get Started
        </button>
      ) : (
        <LoginButton
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          buttonText="Get login !"
        />
      )}
    </div>
  );
}
