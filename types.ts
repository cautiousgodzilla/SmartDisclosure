export enum Phase {
  GENERAL = 'PHASE_0_GENERAL',
  PROBLEM = 'PHASE_1_PROBLEM',
  SOLUTION = 'PHASE_2_SOLUTION',
  LEGAL = 'PHASE_3_LEGAL',
}

export interface MediaAsset {
  id: string;
  type: 'image' | 'file' | 'audio';
  name: string;
  mimeType: string;
  data: string; // Base64
  timestamp: number;
}

export interface IDFData {
  // Metadata
  currentPhase: Phase;
  mediaAssets: MediaAsset[];
  status: 'draft' | 'submitted';

  // Content
  inventorName: string;
  inventorEmail: string;
  title: string;
  generalOverview: string; // New field for Phase 0
  problem: string;
  solution: string;
  technicalDetails: string;
  inventorsList: string;
  testingDates: string;
  publicDisclosures: string;
  upcomingDisclosures: string;
  diagramDescription?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  type?: 'text' | 'audio' | 'image' | 'file';
  fileName?: string;
  timestamp: number;
  phase: Phase; // Track which phase this message belongs to
}

export interface SessionState {
  sessionId: string;
  messages: Message[];
  data: IDFData;
  lastUpdated: number;
}

export enum AppMode {
  LANDING = 'LANDING',
  DASHBOARD = 'DASHBOARD',
  INVENTOR = 'INVENTOR',
  ATTORNEY = 'ATTORNEY',
}

export interface AIResponseSchema {
  updatedFields: Partial<IDFData>;
  aiResponse: string;
  nextPhase?: boolean; // Signal to move to next phase
}