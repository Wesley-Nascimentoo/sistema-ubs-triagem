import type { Priority, ServiceType } from '@/../../shared/types';

// Perguntas para cada tipo de atendimento
export interface Question {
  id: string;
  text: string;
  type: 'yes-no' | 'scale';
  scaleMax?: number;
}

export const QUESTIONS_BY_SERVICE: Record<ServiceType, Question[]> = {
  headache: [
    { id: 'sudden_onset', text: 'A dor de cabeça começou de forma súbita e intensa?', type: 'yes-no' },
    { id: 'worst_ever', text: 'É a pior dor de cabeça que você já teve?', type: 'yes-no' },
    { id: 'vision_changes', text: 'Está tendo alterações na visão?', type: 'yes-no' },
    { id: 'pain_intensity', text: 'Em uma escala de 0 a 10, qual a intensidade da dor?', type: 'scale', scaleMax: 10 },
  ],
  fever: [
    { id: 'high_fever', text: 'A temperatura está acima de 39°C?', type: 'yes-no' },
    { id: 'breathing_difficulty', text: 'Está com dificuldade para respirar?', type: 'yes-no' },
    { id: 'confusion', text: 'Está confuso(a) ou desorientado(a)?', type: 'yes-no' },
    { id: 'days_with_fever', text: 'Há quantos dias está com febre? (0-10)', type: 'scale', scaleMax: 10 },
  ],
  dental: [
    { id: 'severe_pain', text: 'Está com dor intensa que não passa com analgésicos?', type: 'yes-no' },
    { id: 'swelling', text: 'Há inchaço no rosto ou pescoço?', type: 'yes-no' },
    { id: 'bleeding', text: 'Há sangramento que não para?', type: 'yes-no' },
    { id: 'pain_intensity', text: 'Em uma escala de 0 a 10, qual a intensidade da dor?', type: 'scale', scaleMax: 10 },
  ],
  respiratory: [
    { id: 'severe_difficulty', text: 'Está com muita dificuldade para respirar?', type: 'yes-no' },
    { id: 'chest_pain', text: 'Está com dor no peito?', type: 'yes-no' },
    { id: 'blue_lips', text: 'Os lábios ou dedos estão azulados?', type: 'yes-no' },
    { id: 'breathing_difficulty', text: 'Em uma escala de 0 a 10, qual a dificuldade para respirar?', type: 'scale', scaleMax: 10 },
  ],
  injury: [
    { id: 'severe_bleeding', text: 'Há sangramento intenso que não para?', type: 'yes-no' },
    { id: 'bone_exposed', text: 'Há osso exposto ou deformidade visível?', type: 'yes-no' },
    { id: 'cant_move', text: 'Não consegue mover a parte afetada?', type: 'yes-no' },
    { id: 'pain_intensity', text: 'Em uma escala de 0 a 10, qual a intensidade da dor?', type: 'scale', scaleMax: 10 },
  ],
  checkup: [
    { id: 'urgent_symptoms', text: 'Está com algum sintoma que considera urgente?', type: 'yes-no' },
    { id: 'chronic_condition', text: 'Tem alguma condição crônica que precisa acompanhamento?', type: 'yes-no' },
    { id: 'medication_issue', text: 'Está com problema relacionado a medicamentos?', type: 'yes-no' },
  ],
  vaccination: [
    { id: 'allergic_reaction', text: 'Já teve reação alérgica grave a alguma vacina?', type: 'yes-no' },
    { id: 'fever_now', text: 'Está com febre agora?', type: 'yes-no' },
    { id: 'immunocompromised', text: 'Tem alguma condição que afeta o sistema imunológico?', type: 'yes-no' },
  ],
  other: [
    { id: 'severe_symptoms', text: 'Está com sintomas graves ou que pioraram rapidamente?', type: 'yes-no' },
    { id: 'pain_present', text: 'Está com dor?', type: 'yes-no' },
    { id: 'urgent_care', text: 'Considera que precisa de atendimento urgente?', type: 'yes-no' },
    { id: 'symptom_intensity', text: 'Em uma escala de 0 a 10, qual a gravidade dos sintomas?', type: 'scale', scaleMax: 10 },
  ],
};

// Calcular prioridade baseado nas respostas
export function calculatePriority(serviceType: ServiceType, answers: Record<string, boolean | number>): Priority {
  let score = 0;
  
  // Regras específicas por tipo de atendimento
  switch (serviceType) {
    case 'headache':
      if (answers.sudden_onset) score += 3;
      if (answers.worst_ever) score += 3;
      if (answers.vision_changes) score += 2;
      if (typeof answers.pain_intensity === 'number') {
        if (answers.pain_intensity >= 8) score += 3;
        else if (answers.pain_intensity >= 6) score += 2;
        else if (answers.pain_intensity >= 4) score += 1;
      }
      break;
      
    case 'fever':
      if (answers.high_fever) score += 3;
      if (answers.breathing_difficulty) score += 3;
      if (answers.confusion) score += 3;
      if (typeof answers.days_with_fever === 'number') {
        if (answers.days_with_fever >= 5) score += 2;
        else if (answers.days_with_fever >= 3) score += 1;
      }
      break;
      
    case 'dental':
      if (answers.severe_pain) score += 2;
      if (answers.swelling) score += 2;
      if (answers.bleeding) score += 3;
      if (typeof answers.pain_intensity === 'number') {
        if (answers.pain_intensity >= 8) score += 2;
        else if (answers.pain_intensity >= 6) score += 1;
      }
      break;
      
    case 'respiratory':
      if (answers.severe_difficulty) score += 4;
      if (answers.chest_pain) score += 3;
      if (answers.blue_lips) score += 4;
      if (typeof answers.breathing_difficulty === 'number') {
        if (answers.breathing_difficulty >= 8) score += 3;
        else if (answers.breathing_difficulty >= 6) score += 2;
        else if (answers.breathing_difficulty >= 4) score += 1;
      }
      break;
      
    case 'injury':
      if (answers.severe_bleeding) score += 4;
      if (answers.bone_exposed) score += 3;
      if (answers.cant_move) score += 2;
      if (typeof answers.pain_intensity === 'number') {
        if (answers.pain_intensity >= 8) score += 2;
        else if (answers.pain_intensity >= 6) score += 1;
      }
      break;
      
    case 'checkup':
      if (answers.urgent_symptoms) score += 2;
      if (answers.chronic_condition) score += 1;
      if (answers.medication_issue) score += 1;
      break;
      
    case 'vaccination':
      if (answers.allergic_reaction) score += 2;
      if (answers.fever_now) score += 1;
      if (answers.immunocompromised) score += 1;
      break;
      
    case 'other':
      if (answers.severe_symptoms) score += 3;
      if (answers.pain_present) score += 1;
      if (answers.urgent_care) score += 2;
      if (typeof answers.symptom_intensity === 'number') {
        if (answers.symptom_intensity >= 8) score += 3;
        else if (answers.symptom_intensity >= 6) score += 2;
        else if (answers.symptom_intensity >= 4) score += 1;
      }
      break;
  }
  
  // Converter score em prioridade
  if (score >= 9) return 'red';      // Emergência
  if (score >= 6) return 'orange';   // Muito Urgente
  if (score >= 4) return 'yellow';   // Urgente
  if (score >= 2) return 'green';    // Pouco Urgente
  return 'blue';                      // Não Urgente
}
