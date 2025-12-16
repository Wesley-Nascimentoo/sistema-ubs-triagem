/**
 * Utilitário para síntese de voz usando Web Speech API
 * Anuncia pacientes e consultórios
 */

export interface SpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
}

const defaultOptions: SpeechOptions = {
  rate: 1,
  pitch: 1,
  volume: 1,
  lang: 'pt-BR',
};

/**
 * Fala um texto usando Web Speech API
 */
export function speak(text: string, options: SpeechOptions = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    // Cancelar qualquer fala anterior
    window.speechSynthesis.cancel();

    const mergedOptions = { ...defaultOptions, ...options };
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.rate = mergedOptions.rate!;
    utterance.pitch = mergedOptions.pitch!;
    utterance.volume = mergedOptions.volume!;
    utterance.lang = mergedOptions.lang!;
    
    const selectedVoice = getSelectedVoice();
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = (event) => {
      // Ignorar erros de interrupção (quando um novo áudio é iniciado)
      if (event.error === 'interrupted') {
        resolve();
      } else {
        reject(new Error(`Speech error: ${event.error}`));
      }
    };

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Anuncia um paciente sendo chamado
 * Exemplo: "Paciente 1231, se dirigir ao consultório 2"
 */
export async function announcePatient(
  announcementText: string,
  options: SpeechOptions = {}
): Promise<void> {
  await speak(announcementText, {
    ...options,
    rate: 0.9, // Um pouco mais lento para clareza
    pitch: 1.1, // Um pouco mais agudo para melhor compreensão
  });
}

/**
 * Fala um texto repetidamente
 */
export async function speakRepeatedly(
  text: string,
  times: number,
  options: SpeechOptions = {}
): Promise<void> {
  for (let i = 0; i < times; i++) {
    await speak(text, options);
    // Adicionar um pequeno delay entre as repetições
    if (i < times - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}

/**
 * Gera o texto de anúncio de chamada de paciente.
 * Exemplo: "Chamando paciente João da Silva, para a sala de triagem 1."
 */
export function generateCallText(patientName: string, roomName: string): string {
  return `Chamando paciente ${patientName}, para a sala ${roomName}.`;
}

/**
 * Anuncia a chamada de um paciente com repetição de 4 vezes.
 */
export async function callPatient(patientName: string, roomName: string): Promise<void> {
  const text = generateCallText(patientName, roomName);
  await speakRepeatedly(text, 4, {
    rate: 0.9, // Um pouco mais lento para clareza
    pitch: 1.1, // Um pouco mais agudo para melhor compreensão
  });
}

/**
 * Para a fala atual
 */
export function stopSpeech(): void {
  window.speechSynthesis.cancel();
}

/**
 * Verifica se o navegador suporta Web Speech API
 */
export function isSpeechSupported(): boolean {
  return 'speechSynthesis' in window;
}

/**
 * Obtém as vozes disponíveis
 */
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  return window.speechSynthesis.getVoices();
}

/**
 * Define a voz a ser usada
 */
export function setVoice(voiceIndex: number): void {
  const voices = getAvailableVoices();
  if (voices[voiceIndex]) {
    // Armazenar a voz selecionada para uso futuro
    localStorage.setItem('selectedVoiceIndex', voiceIndex.toString());
  }
}

/**
 * Obtém a voz selecionada ou a padrão
 */
export function getSelectedVoice(): SpeechSynthesisVoice | undefined {
  const voices = getAvailableVoices();
  const savedIndex = localStorage.getItem('selectedVoiceIndex');
  
  if (savedIndex && voices[parseInt(savedIndex)]) {
    return voices[parseInt(savedIndex)];
  }

  // Tentar encontrar uma voz em português
  const ptVoice = voices.find(v => v.lang.includes('pt'));
  if (ptVoice) return ptVoice;

  // Fallback para primeira voz disponível
  return voices[0];
}
