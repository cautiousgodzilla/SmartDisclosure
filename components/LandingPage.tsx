import React from 'react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl mb-2">
            Smart<span className="text-indigo-600">Disclosure</span>
          </h1>
          <p className="text-lg text-slate-600">
            Frictionless, AI-Powered Invention Disclosure
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
          <p className="text-slate-500 mb-6">
            Log in to your dashboard to manage your invention portfolio and start new disclosures.
          </p>
          <button
            onClick={onStart}
            className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 md:text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-indigo-200"
          >
            Log In to Inventor Portal
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 ml-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Secure Session • Encrypted • Multimodal Input
        </p>
      </div>
    </div>
  );
};

export default LandingPage;