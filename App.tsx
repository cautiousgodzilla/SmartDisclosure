import React, { useEffect, useState } from 'react';
import LandingPage from './components/LandingPage';
import ChatInterface from './components/ChatInterface';
import LivePreview from './components/LivePreview';
import AttorneyView from './components/AttorneyView';
import Dashboard from './components/Dashboard';
import { AppMode, SessionState, Message, IDFData } from './types';
import { createSession, getSession, saveSession, submitSession } from './services/storageService';

function App() {
  const [mode, setMode] = useState<AppMode>(AppMode.LANDING);
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [idfData, setIDFData] = useState<IDFData | null>(null);

  // Initialize checks based on URL Hash
  useEffect(() => {
    const hash = window.location.hash;
    
    if (hash.startsWith('#attorney/')) {
       const sid = hash.replace('#attorney/', '');
       const session = getSession(sid);
       if (session) {
           setSessionId(sid);
           setMessages(session.messages);
           setIDFData(session.data);
           setMode(AppMode.ATTORNEY);
       } else {
           // Handle invalid attorney link
           alert("Invalid Session ID");
           setMode(AppMode.LANDING);
       }
    } else if (hash.startsWith('#session/')) {
        const sid = hash.replace('#session/', '');
        const session = getSession(sid);
        if (session) {
            setSessionId(sid);
            setMessages(session.messages);
            setIDFData(session.data);
            setMode(AppMode.INVENTOR);
        } else {
             setMode(AppMode.DASHBOARD); // Default to Dashboard if session not found
        }
    } else {
        setMode(AppMode.LANDING);
    }
  }, []);

  const handleLogin = () => {
      setMode(AppMode.DASHBOARD);
  };

  const handleStartNewSession = () => {
    const newId = crypto.randomUUID();
    const session = createSession(newId);
    setSessionId(newId);
    setMessages(session.messages);
    setIDFData(session.data);
    setMode(AppMode.INVENTOR);
    window.location.hash = `session/${newId}`;
  };

  const handleResumeSession = (sid: string) => {
      const session = getSession(sid);
      if (session) {
          setSessionId(sid);
          setMessages(session.messages);
          setIDFData(session.data);
          setMode(AppMode.INVENTOR);
          window.location.hash = `session/${sid}`;
      }
  };

  const saveCurrentState = () => {
      if (!sessionId || !idfData) return;
      const currentState: SessionState = {
          sessionId,
          messages,
          data: idfData,
          lastUpdated: Date.now()
      };
      saveSession(currentState);
  };

  const handleSubmit = () => {
      if(confirm("Are you sure you want to submit? This will lock the session.")) {
          submitSession(sessionId);
          if (idfData) setIDFData({...idfData, status: 'submitted'});
          alert(`Disclosure Submitted!\n\nATTORNEY LINK (Simulated Email): \n${window.location.origin}/#attorney/${sessionId}`);
      }
  };

  const handleBackToDashboard = () => {
      saveCurrentState();
      setMode(AppMode.DASHBOARD);
      window.location.hash = '';
  }

  if (mode === AppMode.LANDING) {
    return <LandingPage onStart={handleLogin} />;
  }

  if (mode === AppMode.DASHBOARD) {
      return <Dashboard onNewDisclosure={handleStartNewSession} onResume={handleResumeSession} />;
  }

  if (mode === AppMode.ATTORNEY && idfData) {
      return <AttorneyView session={{ sessionId, messages, data: idfData, lastUpdated: Date.now() }} />;
  }

  if (mode === AppMode.INVENTOR && idfData) {
    return (
      <div className="flex h-screen overflow-hidden flex-col md:flex-row">
        {/* Navbar for Mobile / Back Button Context */}
        <div className="md:hidden bg-slate-800 text-white p-2 flex justify-between items-center">
            <button onClick={handleBackToDashboard} className="text-xs font-bold flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Dashboard
            </button>
            <span className="text-xs">ID: {sessionId.slice(0,6)}</span>
        </div>

        {/* Left Panel: Chat (60% on large screens) */}
        <div className="w-full md:w-3/5 h-full relative">
          <div className="absolute top-2 left-2 z-20 hidden md:block">
             <button onClick={handleBackToDashboard} className="bg-white/80 backdrop-blur text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-colors shadow-sm" title="Back to Dashboard">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
             </button>
          </div>
          <ChatInterface 
            messages={messages} 
            setMessages={setMessages}
            idfData={idfData}
            setIDFData={setIDFData}
            onSave={saveCurrentState}
            onSubmit={handleSubmit}
          />
        </div>

        {/* Right Panel: Live Preview (40% on large screens, hidden on mobile) */}
        <div className="hidden md:block md:w-2/5 h-full">
          <LivePreview data={idfData} />
        </div>
      </div>
    );
  }

  return <div className="flex items-center justify-center h-screen">Loading...</div>;
}

export default App;