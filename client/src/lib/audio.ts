/**
 * Utilitário para reprodução de som de alerta (beep) usando a tag HTML <audio>.
 * Mais robusto em ambientes de navegador restritos do que a Web Audio API.
 */

// Cria um elemento de áudio global para o som de alerta
const audio = new Audio('/beep.wav');

/**
 * Tenta reproduzir o som de alerta.
 * A reprodução pode falhar se o navegador exigir interação prévia do usuário.
 */
export function playBeep(): void {
  // Reinicia o áudio para que possa ser reproduzido novamente, mesmo que ainda esteja tocando
  audio.currentTime = 0;
  audio.play().catch(error => {
    // Captura o erro de "NotAllowedError: The play() request was interrupted by a call to pause()"
    // ou "NotAllowedError: The play() failed because the user didn't interact with the document first."
    console.warn('Falha ao reproduzir o som de alerta. Pode ser necessário interação do usuário.', error);
  });
}
