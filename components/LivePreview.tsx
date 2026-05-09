import React from 'react';
import { IDFData, Phase } from '../types';

interface LivePreviewProps {
  data: IDFData;
}

const LivePreview: React.FC<LivePreviewProps> = ({ data }) => {
  return (
    <div className="h-full flex flex-col bg-white border-l border-slate-200 shadow-xl overflow-hidden">
      <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-center">
        <div>
           <h2 className="font-serif text-lg font-bold text-slate-800">Invention Summary</h2>
           <p className="text-xs text-slate-500">Live Draft • {data.currentPhase.replace(/PHASE_\d_/, '').replace('_', ' ')}</p>
        </div>
        <div className="px-2 py-1 rounded text-xs font-bold uppercase tracking-wider bg-yellow-100 text-yellow-800 border border-yellow-200">
            {data.status === 'draft' ? 'Draft' : 'Submitted'}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 font-serif">
        
        {/* Media Gallery - Kept as requested previously */}
        {data.mediaAssets.length > 0 && (
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
                <h3 className="text-xs font-sans font-bold text-indigo-600 uppercase mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Media Assets ({data.mediaAssets.length})
                </h3>
                <div className="grid grid-cols-2 gap-2">
                    {data.mediaAssets.map((asset) => (
                        <div key={asset.id} className="group relative border rounded overflow-hidden bg-white hover:shadow-md transition-shadow cursor-pointer">
                            {asset.type === 'image' ? (
                                <img src={`data:${asset.mimeType};base64,${asset.data}`} alt={asset.name} className="w-full h-24 object-cover" />
                            ) : (
                                <div className="w-full h-24 flex flex-col items-center justify-center bg-slate-50 p-2 text-center">
                                    <svg className="w-8 h-8 text-slate-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    <span className="text-[10px] text-slate-500 truncate w-full">{asset.name}</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-sans font-bold transition-opacity">
                                View
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Phase 0: General Overview */}
        <div className={data.currentPhase === Phase.GENERAL ? "ring-2 ring-indigo-100 p-2 -m-2 rounded-lg bg-indigo-50/30" : ""}>
          <h3 className="text-xs font-sans font-bold text-slate-400 uppercase border-b border-slate-100 pb-1 mb-2">Invention Overview</h3>
          <PreviewField label="Working Title" value={data.title} />
          <div className="mt-4">
             <PreviewField label="General Concept" value={data.generalOverview} isTextArea />
          </div>
        </div>

        {/* Phase 1: Problem */}
        <div className={data.currentPhase === Phase.PROBLEM ? "ring-2 ring-indigo-100 p-2 -m-2 rounded-lg bg-indigo-50/30" : ""}>
          <h3 className="text-xs font-sans font-bold text-slate-400 uppercase border-b border-slate-100 pb-1 mb-2">Technical Problem</h3>
          <div className="mt-4">
             <PreviewField label="Deficiency in Prior Art" value={data.problem} isTextArea />
          </div>
        </div>

        {/* Phase 2: Solution */}
        <div className={data.currentPhase === Phase.SOLUTION ? "ring-2 ring-indigo-100 p-2 -m-2 rounded-lg bg-indigo-50/30" : ""}>
          <h3 className="text-xs font-sans font-bold text-slate-400 uppercase border-b border-slate-100 pb-1 mb-2">Technical Solution</h3>
          <PreviewField label="Detailed Solution" value={data.solution} isTextArea />
          <div className="mt-4">
            <PreviewField label="Implementation Details" value={data.technicalDetails} isTextArea />
          </div>
          {data.diagramDescription && (
             <div className="mt-4">
                <PreviewField label="Diagram Description" value={data.diagramDescription} isTextArea />
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PreviewField: React.FC<{label: string, value: string, isTextArea?: boolean}> = ({ label, value, isTextArea }) => (
    <div>
        <label className="block text-[10px] font-sans font-bold text-slate-400 uppercase mb-1">{label}</label>
        <div className={`text-sm text-slate-800 ${isTextArea ? 'whitespace-pre-wrap' : ''} ${!value ? 'italic text-slate-400' : ''}`}>
            {value || "Pending..."}
        </div>
    </div>
);

export default LivePreview;
