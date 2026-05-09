import React, { useEffect, useState } from 'react';
import { SessionState } from '../types';
import { listSessions } from '../services/storageService';

interface DashboardProps {
  onNewDisclosure: () => void;
  onResume: (sessionId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNewDisclosure, onResume }) => {
  const [sessions, setSessions] = useState<SessionState[]>([]);

  useEffect(() => {
    setSessions(listSessions());
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div>
                <h1 className="text-2xl font-extrabold text-slate-800">My Disclosures</h1>
                <p className="text-slate-500 text-sm">Welcome back, Inventor</p>
            </div>
            <button 
                onClick={onNewDisclosure}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                New Disclosure
            </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-4">
            {sessions.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                    <div className="text-slate-300 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">No disclosures yet</h3>
                    <p className="text-slate-500">Get started by creating your first invention record.</p>
                </div>
            ) : (
                sessions.map(session => (
                    <div key={session.sessionId} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex justify-between items-center group">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-lg font-bold text-slate-800">
                                    {session.data.title || "Untitled Invention"}
                                </h3>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${session.data.status === 'submitted' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {session.data.status}
                                </span>
                            </div>
                            <p className="text-slate-500 text-sm line-clamp-1 max-w-2xl">
                                {session.data.problem || "No problem description yet..."}
                            </p>
                            <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                                <span className="flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Updated {new Date(session.lastUpdated).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                                    {session.messages.length} Messages
                                </span>
                            </div>
                        </div>
                        <div>
                            <button 
                                onClick={() => onResume(session.sessionId)}
                                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 font-medium text-sm transition-colors"
                            >
                                {session.data.status === 'submitted' ? 'View' : 'Resume'}
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
