import React from 'react';
import { SessionState } from '../types';

interface AttorneyViewProps {
  session: SessionState;
}

const AttorneyView: React.FC<AttorneyViewProps> = ({ session }) => {
  const { data, messages, sessionId } = session;

  return (
    <div className="min-h-screen bg-slate-100 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Attorney Review Dashboard</h1>
            <p className="text-slate-500">Submission ID: <span className="font-mono text-xs bg-slate-100 p-1 rounded">{sessionId}</span></p>
          </div>
          <div className="text-right">
             <div className="text-sm font-bold text-slate-700">{data.inventorName}</div>
             <div className="text-sm text-slate-500">{data.inventorEmail}</div>
             <div className="text-xs text-slate-400 mt-1">
                Last Updated: {new Date(session.lastUpdated).toLocaleString()}
             </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          
          {/* Main Disclosure - 2 Columns */}
          <div className="col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 print:shadow-none">
              <h2 className="text-xl font-bold border-b pb-4 mb-6">Invention Disclosure Form (Annex B)</h2>
              
              <div className="space-y-6">
                <Section title="1. Title" content={data.title} />
                <Section title="3. Problem Solved" content={data.problem} />
                <Section title="4. Detailed Description" content={data.solution} />
                <Section title="5. Technical Details & Implementation" content={data.technicalDetails} />
                {data.diagramDescription && (
                     <Section title="Diagram Analysis" content={data.diagramDescription} />
                )}
                <Section title="6. Inventorship" content={data.inventorsList} />
                <Section title="7. Testing Dates" content={data.testingDates} />
                <Section title="12/13. Disclosures" content={`${data.publicDisclosures}\n${data.upcomingDisclosures}`} />
              </div>
            </div>
          </div>

          {/* Sidebar: Transcript & Metadata - 1 Column */}
          <div className="space-y-6">
             <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-700 mb-4">Conversation Transcript</h3>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {messages.filter(m => m.role !== 'system').map(msg => (
                        <div key={msg.id} className={`text-sm p-3 rounded ${msg.role === 'assistant' ? 'bg-indigo-50 text-indigo-900' : 'bg-slate-50 text-slate-800'}`}>
                            <div className="text-[10px] font-bold uppercase mb-1 opacity-50">{msg.role}</div>
                            {msg.content}
                        </div>
                    ))}
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const Section: React.FC<{title: string, content: string}> = ({ title, content }) => (
    <div>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">{title}</h4>
        <div className="bg-slate-50 p-4 rounded text-sm text-slate-800 whitespace-pre-wrap leading-relaxed border border-slate-100">
            {content || "N/A"}
        </div>
    </div>
);

export default AttorneyView;
