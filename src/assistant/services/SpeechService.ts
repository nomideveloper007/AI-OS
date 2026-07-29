import { AssistantLogger } from '../core/AssistantLogger';
import { AssistantState } from '../core/AssistantState';

/** Google translate_tts rejects long queries, so speech is played in smaller chunks. */
const TTS_CHUNK_LIMIT = 180;

/** Identical finals arriving inside this window are treated as one utterance. */
const DUPLICATE_RESULT_WINDOW_MS = 3000;

export class SpeechService {
  private static instance: SpeechService;
  private logger = AssistantLogger.getInstance();
  private assistantState = AssistantState.getInstance();
  private currentAudio: HTMLAudioElement | null = null;
  private recognition: any = null;
  private isListening = false;
  private sessionActive = false;
  private isPaused = false;
  private activeLang: 'en-US' | 'ur-PK' = 'en-US';
  private lastResultText = '';
  private lastResultAt = 0;
  private speakToken = 0;
  private rate = 1.0;
  private volume = 1.0;

  // Callbacks
  public onSpeechStart: () => void = () => {};
  public onSpeechEnd: () => void = () => {};
  public onSpeechResult: (text: string) => void = () => {};
  public onError: (error: string) => void = () => {};

  private constructor() {
    this.initSpeechRecognition();
  }

  public static getInstance(): SpeechService {
    if (!SpeechService.instance) {
      SpeechService.instance = new SpeechService();
    }
    return SpeechService.instance;
  }

  public setConfig(volume: number, speed: number) {
    this.volume = volume;
    this.rate = speed;
  }

  private initSpeechRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      this.logger.warn('Speech Recognition not supported in this browser.');
      return;
    }

    this.recognition = new SpeechRecognitionClass();
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.assistantState.setState('listening');
      this.onSpeechStart();
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.onSpeechEnd();

      // The engine ends the stream on its own every few seconds, so keep it alive
      // while a session is open and we are not deliberately paused for a reply.
      if (this.sessionActive && !this.isPaused) {
        try {
          this.recognition.start();
        } catch {
          // ignore
        }
      }
    };

    this.recognition.onerror = (event: any) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      this.logger.error('Speech recognition error', event.error);
      this.onError(event.error);
    };

    this.recognition.onresult = (event: any) => {
      if (this.isPaused) return;

      let text = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          text += event.results[i][0].transcript;
        }
      }
      text = text.trim();
      if (!text) return;

      const now = Date.now();
      if (text === this.lastResultText && now - this.lastResultAt < DUPLICATE_RESULT_WINDOW_MS) {
        this.logger.debug('Dropped repeated speech result: ' + text, 'SpeechService');
        return;
      }
      this.lastResultText = text;
      this.lastResultAt = now;

      this.onSpeechResult(text);
    };
  }

  public startListening(lang: 'en-US' | 'ur-PK' = 'en-US') {
    if (!this.recognition) return;
    this.activeLang = lang;
    this.recognition.lang = lang;
    this.sessionActive = true;
    this.isPaused = false;
    this.tryStartRecognition(0);
  }

  /** Mutes the mic while Saira is thinking or speaking, keeping the session open. */
  public pauseListening() {
    if (!this.recognition) return;
    this.isPaused = true;
    this.lastResultText = '';
    try {
      this.recognition.abort();
    } catch {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
  }

  public resumeListening() {
    if (!this.recognition || !this.sessionActive) return;
    this.isPaused = false;
    this.recognition.lang = this.activeLang;
    this.tryStartRecognition(0);
  }

  /** start() throws while the previous stream is still shutting down, so retry briefly. */
  private tryStartRecognition(attempt: number) {
    if (!this.recognition || !this.sessionActive || this.isPaused || this.isListening) return;
    try {
      this.recognition.start();
    } catch {
      if (attempt < 5) {
        setTimeout(() => this.tryStartRecognition(attempt + 1), 250);
      }
    }
  }

  public setLanguage(lang: 'en-US' | 'ur-PK') {
    this.activeLang = lang;
    if (!this.recognition) return;
    this.recognition.lang = lang;
    if (this.sessionActive && !this.isPaused) {
      this.pauseListening();
      setTimeout(() => this.resumeListening(), 150);
    }
  }

  public stopListening() {
    this.sessionActive = false;
    this.isPaused = true;
    this.lastResultText = '';
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {
        // ignore
      }
    }
    this.assistantState.setState('idle');
  }

  public isSessionListening(): boolean {
    return this.sessionActive;
  }

  public async speak(text: string, isUrdu: boolean): Promise<void> {
    if (typeof window === 'undefined') return;

    const cleanedText = this.cleanSpeechText(text);
    if (!cleanedText) return;

    this.cancelPlayback(false);
    const token = ++this.speakToken;
    this.assistantState.setState('speaking');

    for (const chunk of this.splitForTts(cleanedText)) {
      if (token !== this.speakToken) return;
      const played = await this.playGoogleTts(chunk, isUrdu, token);
      if (token !== this.speakToken) return;
      if (!played) {
        await this.speakBrowserFallback(chunk, isUrdu, token);
        if (token !== this.speakToken) return;
      }
    }

    if (token === this.speakToken) {
      this.currentAudio = null;
      this.assistantState.setState('idle');
    }
  }

  private playGoogleTts(text: string, isUrdu: boolean, token: number): Promise<boolean> {
    return new Promise((resolve) => {
      const tl = this.resolveTtsLang(text, isUrdu);
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
        text
      )}&tl=${tl}&client=tw-ob`;

      const audio = new Audio(ttsUrl);
      this.currentAudio = audio;
      audio.volume = this.volume;
      audio.playbackRate = this.rate;

      // Both onerror and a rejected play() can fire for one failure, and each used to
      // trigger its own fallback, which made Saira read the same reply twice.
      let settled = false;
      const settle = (played: boolean) => {
        if (settled) return;
        settled = true;
        if (this.currentAudio === audio) {
          this.currentAudio = null;
        }
        resolve(played);
      };

      audio.onended = () => settle(true);
      audio.onpause = () => {
        if (!audio.ended) settle(false);
      };
      audio.onerror = () => {
        if (token === this.speakToken) {
          this.logger.warn('Google TTS playback failed, falling back to browser synthesis.');
        }
        settle(false);
      };

      audio.play().catch(() => settle(false));
    });
  }

  private speakBrowserFallback(text: string, isUrdu: boolean, token: number): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        resolve();
        return;
      }

      try {
        window.speechSynthesis.resume();
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }

      setTimeout(() => {
        if (token !== this.speakToken) {
          resolve();
          return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();

        const isUrduScript = /[\u0600-\u06FF]/.test(text);

        if (isUrduScript) {
          const urVoice = voices.find((v) => v.lang.toLowerCase().startsWith('ur'));
          if (urVoice) {
            utterance.voice = urVoice;
            utterance.lang = urVoice.lang;
          } else {
            utterance.lang = 'ur-PK';
          }
        } else if (isUrdu) {
          // Roman Urdu: an Urdu/Hindi/Indian-English voice keeps the pronunciation natural.
          const desiVoice =
            voices.find((v) => v.lang.toLowerCase().startsWith('ur')) ||
            voices.find((v) => v.lang.toLowerCase().startsWith('hi')) ||
            voices.find((v) => v.lang.toLowerCase().startsWith('en-in'));
          if (desiVoice) {
            utterance.voice = desiVoice;
            utterance.lang = desiVoice.lang;
          } else {
            utterance.lang = 'en-IN';
          }
        } else {
          const enVoice = voices.find(
            (v) =>
              v.lang.toLowerCase().startsWith('en') &&
              (v.name.includes('Google') || v.name.includes('Samantha'))
          );
          if (enVoice) {
            utterance.voice = enVoice;
            utterance.lang = enVoice.lang;
          } else {
            utterance.lang = 'en-US';
          }
        }

        utterance.rate = this.rate;
        utterance.volume = this.volume;

        let settled = false;
        const settle = () => {
          if (settled) return;
          settled = true;
          resolve();
        };

        utterance.onend = settle;
        utterance.onerror = settle;

        window.speechSynthesis.speak(utterance);
      }, 50);
    });
  }

  public cancelPlayback(resetState = true) {
    this.speakToken++;
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
      } catch {
        // ignore
      }
      this.currentAudio = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (resetState) {
      this.assistantState.setState('idle');
    }
  }

  private resolveTtsLang(text: string, isUrdu: boolean): string {
    if (/[\u0600-\u06FF]/.test(text)) return 'ur';
    // Latin-script Urdu read by the English voice is unintelligible; the Hindi
    // voice transliterates Roman Urdu close to how a native speaker says it.
    if (isUrdu) return 'hi';
    return 'en';
  }

  private splitForTts(text: string): string[] {
    if (text.length <= TTS_CHUNK_LIMIT) return [text];

    const chunks: string[] = [];
    let rest = text;

    while (rest.length > TTS_CHUNK_LIMIT) {
      let cut = -1;
      for (const separator of ['۔', '؟', '.', '!', '?', ',', '،', ' ']) {
        cut = rest.lastIndexOf(separator, TTS_CHUNK_LIMIT);
        if (cut > TTS_CHUNK_LIMIT * 0.4) break;
      }
      if (cut <= 0) cut = TTS_CHUNK_LIMIT - 1;

      const piece = rest.slice(0, cut + 1).trim();
      if (piece) chunks.push(piece);
      rest = rest.slice(cut + 1).trim();
    }

    if (rest) chunks.push(rest);
    return chunks;
  }

  private cleanSpeechText(text: string): string {
    return text
      .replace(/\*\*+/g, '')
      .replace(/[*#_`]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
