// ─── Vitest Global Setup ───
import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Mock Web Speech API (not available in jsdom)
const mockSpeak = vi.fn();
const mockCancel = vi.fn();
const mockGetVoices = vi.fn(() => []);
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();

Object.defineProperty(globalThis, 'speechSynthesis', {
    value: {
        speak: mockSpeak,
        cancel: mockCancel,
        getVoices: mockGetVoices,
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
        resume: vi.fn(),
        pause: vi.fn(),
        pending: false,
        speaking: false,
        paused: false,
    },
    writable: true,
});

// Mock SpeechSynthesisUtterance
globalThis.SpeechSynthesisUtterance = vi.fn().mockImplementation((text: string) => ({
    text,
    lang: '',
    rate: 1,
    pitch: 1,
    volume: 1,
    onend: null as (() => void) | null,
    onerror: null as ((e: unknown) => void) | null,
}));
