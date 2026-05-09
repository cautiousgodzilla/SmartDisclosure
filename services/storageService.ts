import { SessionState, IDFData, Message, Phase } from '../types';
import { INITIAL_IDF_DATA, PHASE_START_PROMPTS } from '../constants';

const STORAGE_KEY_PREFIX = 'smart_idf_session_';

export const getSession = (sessionId: string): SessionState | null => {
  const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${sessionId}`);
  if (!stored) return null;
  return JSON.parse(stored);
};

export const listSessions = (): SessionState[] => {
    const sessions: SessionState[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
            const val = localStorage.getItem(key);
            if (val) {
                try {
                    sessions.push(JSON.parse(val));
                } catch(e) {
                    console.error("Failed to parse session", key);
                }
            }
        }
    }
    // Sort by last updated (newest first)
    return sessions.sort((a, b) => b.lastUpdated - a.lastUpdated);
};

export const createSession = (sessionId: string): SessionState => {
  const newSession: SessionState = {
    sessionId,
    messages: [{
      id: 'init',
      role: 'assistant',
      // UPDATED: Use the shared constant
      content: PHASE_START_PROMPTS[Phase.GENERAL],
      timestamp: Date.now(),
      phase: Phase.GENERAL, 
      type: 'text'
    }],
    data: { ...INITIAL_IDF_DATA },
    lastUpdated: Date.now()
  };
  saveSession(newSession);
  return newSession;
};

export const saveSession = (session: SessionState): void => {
  localStorage.setItem(`${STORAGE_KEY_PREFIX}${session.sessionId}`, JSON.stringify(session));
};

export const submitSession = (sessionId: string): void => {
    const session = getSession(sessionId);
    if(session) {
        session.data.status = 'submitted';
        saveSession(session);
    }
}