/**
 * Module: types
 * ============
 * 
 * Central definitions of interfaces and types used across the application.
 * Adheres to strict type safety principles of Maximus 2.0.
 */

export interface PatientData {
  age: string;
  sex: 'M' | 'F' | 'Other' | '';
  weight: string;
  height: string;
  location: string;
  symptoms: string;
  history: string;
  vitals: string; // Free text for BP, HR, Temp etc.
  context: string; // Regional epidemiology, resource access
}

export interface Attachment {
  mimeType: string;
  data: string; // base64
  name: string;
}

export enum AppStep {
  INPUT = 'INPUT',
  ANALYZING = 'ANALYZING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}

export enum AppTab {
  DIAGNOSTIC = 'DIAGNOSTIC',
  TELEMEDICINE = 'TELEMEDICINE',
  HISTORY = 'HISTORY',
  DR_HOUSE = 'DR_HOUSE',
  VISION = 'VISION'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp?: number;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  lastMessageAt: number;
  messages: ChatMessage[];
  preview: string;
}

/**
 * Represents a part of the content sent to the Gemini API.
 * Replaces implicit 'any' usage.
 */
export interface GeminiPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

/**
 * Base custom error class for the application.
 */
export class VerticeError extends Error {
  constructor(message: string, public code: string = 'UNKNOWN_ERROR') {
    super(message);
    this.name = 'VerticeError';
  }
}