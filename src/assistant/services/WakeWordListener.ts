import { AssistantLogger } from '../core/AssistantLogger';
import { AssistantEvents } from '../core/AssistantEvents';

export class WakeWordListener {
  private static instance: WakeWordListener;
  private logger = AssistantLogger.getInstance();
  private events = AssistantEvents.getInstance();
  private recognition: any = null;
  private isListening = false;
  private isMuted = false;

  private constructor() {
    this.initRecognition();
  }

  public static getInstance(): WakeWordListener {
    if (!WakeWordListener.instance) {
      WakeWordListener.instance = new WakeWordListener();
    }
    return WakeWordListener.instance;
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      this.logger.warn('Speech Recognition not supported for Wake Word Listener.');
      return;
    }

    this.recognition = new SpeechRecognitionClass();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      this.isListening = true;
      this.logger.info('Wake Word Listener started in background', 'WakeWordListener');
    };

    this.recognition.onend = () => {
      this.isListening = false;
      // Auto restart background listening if still requested
      if (!this.isMuted) {
        try {
          this.recognition.start();
        } catch {
          // ignore
        }
      }
    };

    this.recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech') {
        this.logger.debug(`Wake word recognition error: ${event.error}`, 'WakeWordListener');
      }
    };

    this.recognition.onresult = (event: any) => {
      if (this.isMuted) return;

      const last = event.results.length - 1;
      const text = event.results[last][0].transcript.trim().toLowerCase();

      // Match "hey saira", "hi saira", "hello saira", or solo "saira"
      if (
        text.includes('hey saira') ||
        text.includes('heysaira') ||
        text.includes('hi saira') ||
        text.includes('hello saira') ||
        text === 'saira'
      ) {
        this.logger.info('Wake word detected!', 'WakeWordListener');
        this.events.emit('wakeword_detected');
      }
    };
  }

  public startListening() {
    if (!this.recognition || this.isListening) return;
    this.isMuted = false;
    try {
      this.recognition.start();
    } catch {
      // ignore
    }
  }

  public stopListening() {
    this.isMuted = true;
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
  }
}
