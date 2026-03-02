// ─── Vitest Global Setup ───
import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Mock Web Speech API (not available in jsdom)
const mockCancel = vi.fn();
const mockGetVoices = vi.fn(() => []);
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();

// When speak(utterance) is called, fire utterance.onend so speakAsync resolves (for playScenario tests)
function mockSpeak(utterance: { onend?: () => void }) {
    if (utterance?.onend) queueMicrotask(() => utterance.onend!());
}

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

// Mock SpeechSynthesisUtterance as a constructor so `new SpeechSynthesisUtterance(text)` works
class MockSpeechSynthesisUtterance {
    text = '';
    lang = '';
    rate = 1;
    pitch = 1;
    volume = 1;
    onend: (() => void) | null = null;
    onerror: ((e: unknown) => void) | null = null;
    constructor(text: string) {
        this.text = text;
    }
}
globalThis.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance as unknown as typeof SpeechSynthesisUtterance;
