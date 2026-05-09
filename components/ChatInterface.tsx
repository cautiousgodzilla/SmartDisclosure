import React, { useState, useRef, useEffect } from 'react';
import { Message, IDFData, Phase, MediaAsset } from '../types';
import AudioRecorder from './AudioRecorder';
import { generateAIResponse, AIInputData } from '../services/geminiService';
import { PHASE_START_PROMPTS } from '../constants';

interface ChatInterfaceProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  idfData: IDFData;
  setIDFData: React.Dispatch<React.SetStateAction<IDFData>>;
  onSave: () => void;
  onSubmit: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  setMessages, 
  idfData, 
  setIDFData,
  onSave,
  onSubmit
}) => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expandedPhase, setExpandedPhase] = useState<Phase | null>(null);

  // Auto-scroll only if looking at current phase
  useEffect(() => {
    if (!expandedPhase || expandedPhase === idfData.currentPhase) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, expandedPhase, idfData.currentPhase]);

  // Helper to transition phase
  const getNextPhase = (current: Phase): Phase | null => {
      if (current === Phase.GENERAL) return Phase.PROBLEM;
      if (current === Phase.PROBLEM) return Phase.SOLUTION;
      if (current === Phase.SOLUTION) return Phase.LEGAL;
      return null;
  };

  const processInput = async (
      text: string | undefined, 
      audioBlob: Blob | undefined, 
      file: File | undefined
  ) => {
    setIsProcessing(true);
    const timestamp = Date.now();

    // 1. Handle File Reading & State Update (Media Assets)
    let mediaData: AIInputData['media'] | undefined = undefined;
    let audioBase64: string | undefined = undefined;
    let newAssets: MediaAsset[] = [];

    if (audioBlob) {
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        await new Promise(resolve => reader.onloadend = resolve);
        const base64 = (reader.result as string).split(',')[1];
        audioBase64 = base64;
    }

    if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        await new Promise(resolve => reader.onloadend = resolve);
        const base64 = (reader.result as string).split(',')[1];
        const isText = file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md');
        
        mediaData = {
            mimeType: file.type,
            data: isText ? await file.text() : base64,
            isText: isText
        };

        // Add to Media Assets in Data State
        newAssets.push({
            id: crypto.randomUUID(),
            type: file.type.startsWith('image/') ? 'image' : 'file',
            name: file.name,
            mimeType: file.type,
            data: base64, // Always store binary as base64 for display
            timestamp
        });
    }

    // 2. Update Message History
    let userContent = text || '';
    if (audioBlob) userContent = '🎤 [Audio Input]';
    if (file) userContent = `📎 [Attached: ${file.name}]`;

    const newMessage: Message = {
      id: `msg-${timestamp}`,
      role: 'user',
      content: userContent,
      type: audioBlob ? 'audio' : (file ? (file.type.startsWith('image') ? 'image' : 'file') : 'text'),
      fileName: file?.name,
      timestamp,
      phase: idfData.currentPhase 
    };
    
    const newHistory = [...messages, newMessage];
    setMessages(newHistory);
    setInputText('');

    // Update IDF Data with new assets immediately
    const dataWithAssets = {
        ...idfData,
        mediaAssets: [...idfData.mediaAssets, ...newAssets]
    };
    setIDFData(dataWithAssets);

    // 3. Call AI
    const aiInput: AIInputData = { 
        text, 
        audioBase64,
        media: mediaData
    };

    const aiResult = await generateAIResponse(dataWithAssets, newHistory, aiInput);

    // 4. Process AI Result & Transitions
    let nextPhaseEnum = idfData.currentPhase;
    let isPhaseChange = false;

    if (aiResult.nextPhase) {
        const next = getNextPhase(idfData.currentPhase);
        if (next) {
            nextPhaseEnum = next;
            isPhaseChange = true;
        }
    }

    // Update Fields & Phase
    setIDFData(prev => ({ 
        ...prev, 
        ...aiResult.updatedFields, 
        currentPhase: nextPhaseEnum,
    }));

    // Build messages list to append
    const messagesToAppend: Message[] = [];

    // A. Add AI Response (Wrap up previous phase)
    messagesToAppend.push({
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: aiResult.aiResponse,
        timestamp: Date.now(),
        phase: idfData.currentPhase // Belongs to the phase it was generated in
    });

    // B. If phase changed, inject the Start Prompt for the NEW phase
    if (isPhaseChange) {
        messagesToAppend.push({
            id: `msg-${Date.now() + 1}`,
            role: 'assistant',
            content: PHASE_START_PROMPTS[nextPhaseEnum],
            timestamp: Date.now() + 1,
            phase: nextPhaseEnum // Belongs to the new phase
        });
    }

    setMessages(prev => [...prev, ...messagesToAppend]);
    
    setTimeout(onSave, 100); 
    setIsProcessing(false);
  };

  const handleSendText = () => {
    if (!inputText.trim()) return;
    processInput(inputText, undefined, undefined);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          processInput(undefined, undefined, e.target.files[0]);
      }
      if(fileInputRef.current) fileInputRef.current.value = '';
  };

  // Group messages by phase for rendering accordions
  const renderPhaseGroup = (phase: Phase, title: string) => {
    const phaseMessages = messages.filter(m => m.phase === phase);
    const isActive = idfData.currentPhase === phase;
    const isPast = !isActive && phaseMessages.length > 0;
    
    // Auto-collapse past phases unless manually toggled
    const isOpen = isActive || expandedPhase === phase;

    if (!isPast && !isActive) return null; // Don't show future phases

    return (
        <div key={phase} className="mb-2 border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm">
            <button 
                onClick={() => setExpandedPhase(isOpen ? null : phase)}
                className={`w-full px-4 py-3 flex justify-between items-center text-sm font-bold ${isActive ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-50 text-slate-600'}`}
            >
                <span>{title} {isActive && <span className="ml-2 px-2 py-0.5 bg-indigo-200 text-indigo-800 rounded text-[10px]">ACTIVE</span>}</span>
                <svg className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            
            {isOpen && (
                <div className="bg-slate-50 p-4 space-y-4 border-t border-slate-100">
                    {phaseMessages.length === 0 && <div className="text-center text-slate-400 text-xs italic py-4">Start the conversation below...</div>}
                    {phaseMessages.map((msg) => (
                        <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[90%] p-3 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                                msg.role === 'user' 
                                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                            }`}>
                                {msg.type !== 'text' && <div className="text-[10px] uppercase font-bold opacity-75 mb-1 border-b border-white/20 pb-1 flex items-center gap-1">
                                    {msg.type === 'audio' && '🎤 Audio Input'}
                                    {msg.type === 'image' && '🖼️ Image Attachment'}
                                    {msg.type === 'file' && '📄 File Attachment'}
                                </div>}
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isActive && <div ref={messagesEndRef} />}
                </div>
            )}
        </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 relative">
      <div className="bg-indigo-600 text-white text-xs px-4 py-2 flex justify-between items-center shadow-md z-10">
        <span className="font-bold tracking-wide">SMART DISCLOSURE SESSION</span>
        <button onClick={onSubmit} className="bg-green-500 hover:bg-green-400 text-white px-3 py-1 rounded text-xs font-bold transition-colors">
            SUBMIT
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
         {renderPhaseGroup(Phase.GENERAL, "0. General Inquiry")}
         {renderPhaseGroup(Phase.PROBLEM, "1. Problem Identification")}
         {renderPhaseGroup(Phase.SOLUTION, "2. Detailed Solution")}
         {renderPhaseGroup(Phase.LEGAL, "3. Legal & Formalities")}

         {isProcessing && (
            <div className="flex justify-start w-full px-4 mt-2">
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-bold mr-2">Thinking</span>
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-75"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-150"></div>
                </div>
            </div>
         )}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 p-4 shadow-lg z-20">
        <div className="max-w-4xl mx-auto flex items-end gap-3">
          <button 
             onClick={() => fileInputRef.current?.click()}
             disabled={isProcessing}
             className="p-3 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
             </svg>
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf,.txt,.md,.csv,.json" onChange={handleFileUpload} />

          <AudioRecorder onRecordingComplete={(b) => processInput(undefined, b, undefined)} disabled={isProcessing} />

          <div className="flex-1 bg-slate-100 rounded-2xl p-1 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendText();
                }
              }}
              placeholder={isProcessing ? "AI is reviewing..." : `Type here for ${idfData.currentPhase.replace(/PHASE_\d_/, '').toLowerCase()}...`}
              disabled={isProcessing}
              className="w-full bg-transparent border-none focus:ring-0 p-3 text-sm max-h-32 resize-none disabled:opacity-50"
              rows={1}
            />
          </div>

          <button
            onClick={handleSendText}
            disabled={!inputText.trim() || isProcessing}
            className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.126A59.768 59.768 0 0 1 21.485 12 59.77 59.77 0 0 1 3.27 20.876L5.999 12Zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;