"use client";

import { FaExclamationTriangle } from "react-icons/fa";

const ErrorPage = () => {
  

  const handleRefresh = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-6">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <FaExclamationTriangle className="text-red-500 text-6xl mb-4 animate-pulse" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Oohoo! Connection Failed</h1>
        <p className="text-gray-600 mb-4">Something went wrong. Please try refreshing the page.</p>
        <button
          onClick={handleRefresh}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;
