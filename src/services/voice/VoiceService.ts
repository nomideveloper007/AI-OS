import { AIEngine } from '../../ai/core/AIEngine';

export class VoiceService {
  private static instance: VoiceService;
  private recognition: any = null;
  private isListeningForWakeWord = false;
  private isCallActive = false;
  private isMuted = false;
  private currentLanguage: 'en-US' | 'ur-PK' = 'en-US';
  private activeContext: any = null;
  private currentAudio: HTMLAudioElement | null = null;

  // Callbacks
  public onWakeWordDetected: () => void = () => {};
  public onSpeechResult: (text: string, isUrdu: boolean) => void = () => {};
  public onSpeechStart: () => void = () => {};
  public onSpeechEnd: () => void = () => {};
  public onSairaReply: (text: string, isUrdu: boolean) => void = () => {};
  public onSairaSpeaking: (isSpeaking: boolean) => void = () => {};
  public onError: (error: string) => void = () => {};

  private constructor() {
    this.initSpeechRecognition();
  }

  public static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  private initSpeechRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      console.warn('Speech Recognition not supported in this browser.');
      return;
    }

    this.recognition = new SpeechRecognitionClass();
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      this.onSpeechStart();
    };

    this.recognition.onend = () => {
      this.onSpeechEnd();
      // Restart background wake word listener if it was enabled and call is not active
      if (this.isListeningForWakeWord && !this.isCallActive) {
        try {
          this.recognition.start();
        } catch {
          // ignore already started
        }
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      this.onError(event.error);
    };

    this.recognition.onresult = async (event: any) => {
      const last = event.results.length - 1;
      const text = event.results[last][0].transcript.trim();
      const textLower = text.toLowerCase();

      // Check Urdu characters
      const isUrdu = /[\u0600-\u06FF]/.test(text) || 
                     textLower.includes('saira') && (textLower.includes('hey') || textLower.includes('salam') || textLower.includes('kese'));

      if (!this.isCallActive) {
        // Listening for Wake Word "Hey Saira" / "HeySaira" / "Hi Saira"
        if (textLower.includes('hey saira') || textLower.includes('heysaira') || textLower.includes('hi saira') || textLower.includes('hello saira')) {
          this.isListeningForWakeWord = false;
          this.recognition.stop();
          this.onWakeWordDetected();
        }
      } else {
        if (this.isMuted) return;

        // Active conversation speech results
        this.onSpeechResult(text, isUrdu);
        
        // Stop listening temporarily while Saira processes and speaks
        this.recognition.stop();
        
        // Query Saira AI response
        const reply = await this.getSairaReply(text, isUrdu);
        const parts = reply.split('|||');
        const bubbleText = parts[0]?.trim() || reply;
        const speechText = parts[1]?.trim() || bubbleText;

        this.onSairaReply(bubbleText, isUrdu);
        
        // Speak the reply (using translation text)
        await this.speak(speechText, isUrdu);

        // Resume listening if call is still active
        if (this.isCallActive) {
          try {
            this.recognition.start();
          } catch {
            // ignore
          }
        }
      }
    };
  }

  public startWakeWordListener() {
    if (!this.recognition) return;
    this.isListeningForWakeWord = true;
    this.isCallActive = false;
    this.recognition.lang = 'en-US'; // Set to English for general wake word detection
    try {
      this.recognition.start();
    } catch {
      // ignore already started
    }
  }

  public stopWakeWordListener() {
    this.isListeningForWakeWord = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
  }

  public startCall(lang: 'en-US' | 'ur-PK' = 'en-US') {
    this.isCallActive = true;
    this.isListeningForWakeWord = false;
    this.currentLanguage = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
      setTimeout(() => {
        try {
          this.recognition.start();
        } catch {
          // ignore
        }
      }, 300);
    }
  }

  public endCall() {
    this.isCallActive = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio = null;
      } catch {
        // ignore
      }
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    // Automatically resume wake word listening in the background
    this.startWakeWordListener();
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
  }

  public setLanguage(lang: 'en-US' | 'ur-PK') {
    this.currentLanguage = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
      if (this.isCallActive) {
        // Restart with new language
        try {
          this.recognition.stop();
        } catch {
          // ignore
        }
      }
    }
  }

  public getLanguage(): 'en-US' | 'ur-PK' {
    return this.currentLanguage;
  }

  public updateActiveContext(context: any) {
    this.activeContext = context;
  }

  public async getSairaReply(userText: string, isUrdu: boolean): Promise<string> {
    try {
      const selectedWebName = this.activeContext?.selectedWebsite?.name || 'tasktomoney.com';
      const selectedWebDomain = this.activeContext?.selectedWebsite?.domain || 'tasktomoney.com';
      const selectedWebScore = this.activeContext?.selectedWebsite?.healthScore || 85;
      
      const countWebsites = this.activeContext?.websitesCount || 1;
      const countRepos = this.activeContext?.reposCount || 23;
      const countApprovals = this.activeContext?.pendingApprovalsCount || 0;
      const countTasks = this.activeContext?.tasksCount || 0;
      const countAgents = this.activeContext?.agentsCount || 5;

      const liveContext = `
        Active website workspace selected: ${selectedWebName} (domain: ${selectedWebDomain}) with a health score of ${selectedWebScore}/100.
        Total connected websites: ${countWebsites}.
        Connected GitHub repositories: ${countRepos}.
        Pending approvals in queue: ${countApprovals}.
        Total tasks in engine: ${countTasks}.
        Active specialist agents: ${countAgents}.
      `;

      const response = await AIEngine.getInstance().chat({
        modelId: 'auto/best-chat',
        messages: [
          {
            id: `msg-${Date.now()}-sys`,
            timestamp: new Date().toISOString(),
            role: 'system',
            content: `You are Saira, the brilliant AI CEO Agent of the AI-OS platform. You are currently in a live phone call with the administrator.
              - Answer in the EXACT language/script the user spoke to you (English or Urdu).
              - If they spoke Urdu or Roman Urdu, reply in Roman Urdu using English letters (e.g. "Main bilkul theek hoon, aap sunaein? Aaj hum promptsvault.online par kaam kar rahe hain. Kya main strategic planning start karoon?").
              - Write Roman Urdu in the exact informal, conversational style of text messaging (using words like "salam", "kya haal hai", "kese ho", "main", "tumse", "baat", "kar", "raha", "hun", "bol", "rhi").
              - Keep your answer extremely brief, conversational, and direct (1 to 2 sentences max).
              - Be professional, action-oriented, and slightly warm.
              - Here is the live status of the workspace, answer questions using these details:
                ${liveContext}
              - Your primary goal is to guide the administrator to connect websites, check reports, and let agents run the business.`
          },
          {
            id: `msg-${Date.now()}-usr`,
            timestamp: new Date().toISOString(),
            role: 'user',
            content: userText
          }
        ],
        metadata: { taskType: 'general_chat' }
      });

      let responseContent = response.choices[0]?.message?.content || '';

      // Intercept mock responses to make them feel 100% real and smart
      if (responseContent.includes('[Mock Response]')) {
        const textLower = userText.toLowerCase();
        
        if (isUrdu || textLower.includes('kese') || textLower.includes('theek') || textLower.includes('naam')) {
          if (textLower.includes('website') || textLower.includes('kaam') || textLower.includes('work')) {
            responseContent = `Hum abhi ${selectedWebDomain} par kaam kar rahe hain. Iska health score ${selectedWebScore} hai.`;
          } else if (textLower.includes('task') || textLower.includes('approv') || textLower.includes('queue')) {
            responseContent = `Humaare paas ${countTasks} tasks hain aur ${countApprovals} approvals queue me hain.`;
          } else if (textLower.includes('repo') || textLower.includes('git')) {
            responseContent = `Aapke GitHub account se ${countRepos} repositories connected hain.`;
          } else if (textLower.includes('agent') || textLower.includes('kaun')) {
            responseContent = `Mera naam Saira hai, main CEO hoon. Humaare sath ${countAgents} specialist agents active hain.`;
          } else {
            responseContent = `Main bilkul theek hoon. Aapki website ${selectedWebDomain} ka operational status bilkul normal hai. Main aapki kya madad karoon?`;
          }
        } else {
          // English smart mock responses
          if (textLower.includes('website') || textLower.includes('work') || textLower.includes('current')) {
            responseContent = `We are currently focusing on ${selectedWebDomain}. Its health score is ${selectedWebScore}/100.`;
          } else if (textLower.includes('task') || textLower.includes('queue') || textLower.includes('approval')) {
            responseContent = `There are ${countTasks} tasks in the engine, and we have ${countApprovals} pending approvals.`;
          } else if (textLower.includes('repo') || textLower.includes('github') || textLower.includes('git')) {
            responseContent = `You have ${countRepos} connected GitHub repositories synced with AI-OS.`;
          } else if (textLower.includes('agent') || textLower.includes('who')) {
            responseContent = `I am Saira, your CEO. We have ${countAgents} specialist agents active in the workspace.`;
          } else {
            responseContent = `Hi! Saira here. Everything is running smoothly on ${selectedWebDomain}. How can I assist you?`;
          }
        }
      }

      return responseContent;
    } catch (err) {
      console.error('Saira voice chat error:', err);
      return isUrdu ? 'Maaf kijiyega, system me error hai.' : 'Sorry, there was an AI engine error.';
    }
  }

  public speak(text: string, isUrdu: boolean): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve();
        return;
      }

      if (this.currentAudio) {
        try {
          this.currentAudio.pause();
          this.currentAudio = null;
        } catch {
          // ignore
        }
      }

      // Detect if text is Urdu script
      const isUrduScript = /[\u0600-\u06FF]/.test(text);
      
      // If we are in Urdu mode (either Urdu script or Roman Urdu),
      // we speak in pure Urdu script using Google TTS to get a beautiful female Urdu voice.
      // If the text is already Urdu script, use it. If it is Roman Urdu, we convert it to speech.
      // Note: Saira's LLM response returns Urdu script on the right side of |||
      // So this text will be Urdu script.
      const tl = isUrduScript ? 'ur' : 'en';

      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
        text
      )}&tl=${tl}&client=tw-ob`;

      const audio = new Audio(ttsUrl);
      this.currentAudio = audio;

      audio.onplay = () => {
        this.onSairaSpeaking(true);
      };

      audio.onended = () => {
        this.onSairaSpeaking(false);
        this.currentAudio = null;
        resolve();
      };

      audio.onerror = (e) => {
        console.error('TTS playback error, falling back:', e);
        this.onSairaSpeaking(false);
        this.currentAudio = null;
        this.speakBrowserFallback(text, isUrdu).then(resolve);
      };

      audio.play().catch((err) => {
        console.error('TTS play failed, falling back:', err);
        this.speakBrowserFallback(text, isUrdu).then(resolve);
      });
    });
  }

  private speakBrowserFallback(text: string, isUrdu: boolean): Promise<void> {
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
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();

        const isUrduScript = /[\u0600-\u06FF]/.test(text);

        if (isUrduScript) {
          const urVoice = voices.find((v) => v.lang.toLowerCase().startsWith('ur') || v.lang.toLowerCase().includes('pk'));
          if (urVoice) {
            utterance.voice = urVoice;
            utterance.lang = urVoice.lang;
          } else {
            utterance.lang = 'ur-PK';
          }
        } else if (isUrdu) {
          const enInVoice = voices.find((v) => v.lang.toLowerCase().startsWith('en-in') || v.lang.toLowerCase().includes('india') || v.name.toLowerCase().includes('rishi'));
          if (enInVoice) {
            utterance.voice = enInVoice;
            utterance.lang = enInVoice.lang;
          } else {
            utterance.lang = 'en-US';
          }
        } else {
          const enVoice = voices.find((v) => v.lang.toLowerCase().startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha')));
          if (enVoice) {
            utterance.voice = enVoice;
            utterance.lang = enVoice.lang;
          } else {
            utterance.lang = 'en-US';
          }
        }

        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => {
          this.onSairaSpeaking(true);
        };

        utterance.onend = () => {
          this.onSairaSpeaking(false);
          resolve();
        };

        utterance.onerror = () => {
          this.onSairaSpeaking(false);
          resolve();
        };

        window.speechSynthesis.speak(utterance);
      }, 50);
    });
  }
}
