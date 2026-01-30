/**
 * Entry Point Questions
 *
 * These questions from the onboarding indicate whether a couple
 * has already booked/closed a vendor or service, or if they need one.
 *
 * bookedResponse: The response value that means "already have it" or "want it"
 */

export interface EntryPointQuestion {
  id: string;
  label: string;
  phase: "PHASE_CEREMONY" | "PHASE_CELEBRATION";
  bookedResponse: string;
}

export const AVAILABLE_ENTRY_POINT_QUESTIONS: EntryPointQuestion[] = [
  // =========================================================================
  // CEREMONY PHASE
  // =========================================================================
  {
    id: "ceremony_venue_booked",
    label: "Lugar de ceremonia",
    phase: "PHASE_CEREMONY",
    bookedResponse: "yes",
  },
  {
    id: "civil_expediente_done",
    label: "Expediente civil",
    phase: "PHASE_CEREMONY",
    bookedResponse: "yes",
  },
  {
    id: "canonical_expediente_done",
    label: "Expediente canonico",
    phase: "PHASE_CEREMONY",
    bookedResponse: "yes",
  },
  {
    id: "ceremony_master_of_ceremony_needed",
    label: "Maestro de ceremonias",
    phase: "PHASE_CEREMONY",
    bookedResponse: "yes",
  },
  {
    id: "decide_lectures_needed",
    label: "Lecturas ceremonia",
    phase: "PHASE_CEREMONY",
    bookedResponse: "yes",
  },
  {
    id: "arras_needed",
    label: "Arras",
    phase: "PHASE_CEREMONY",
    bookedResponse: "yes",
  },
  {
    id: "band_ceremony_needed",
    label: "Musica ceremonia",
    phase: "PHASE_CEREMONY",
    bookedResponse: "yes",
  },
  {
    id: "ring_exchange_needed",
    label: "Intercambio anillos",
    phase: "PHASE_CEREMONY",
    bookedResponse: "yes",
  },
  {
    id: "vow_exchange_needed",
    label: "Intercambio votos",
    phase: "PHASE_CEREMONY",
    bookedResponse: "yes",
  },
  {
    id: "rice_flowes_throw_needed",
    label: "Arroz/Petalos",
    phase: "PHASE_CEREMONY",
    bookedResponse: "yes",
  },
  {
    id: "witnesses_needed",
    label: "Testigos",
    phase: "PHASE_CEREMONY",
    bookedResponse: "yes",
  },
  {
    id: "bride_maid_of_honor_needed",
    label: "Dama de honor",
    phase: "PHASE_CEREMONY",
    bookedResponse: "yes",
  },
  {
    id: "car_rental_needed",
    label: "Coche nupcial",
    phase: "PHASE_CEREMONY",
    bookedResponse: "yes",
  },

  // =========================================================================
  // CELEBRATION PHASE
  // =========================================================================
  {
    id: "venue_search_started",
    label: "Lugar de celebracion",
    phase: "PHASE_CELEBRATION",
    bookedResponse: "already_booked",
  },
  {
    id: "wedding_planner_needed",
    label: "Wedding Planner",
    phase: "PHASE_CELEBRATION",
    bookedResponse: "yes",
  },
  {
    id: "photographer_booked",
    label: "Fotografo",
    phase: "PHASE_CELEBRATION",
    bookedResponse: "yes",
  },
  {
    id: "separacion_de_bienes",
    label: "Separacion de bienes",
    phase: "PHASE_CELEBRATION",
    bookedResponse: "yes",
  },
  {
    id: "security_staff_needed",
    label: "Seguridad",
    phase: "PHASE_CELEBRATION",
    bookedResponse: "yes",
  },
  {
    id: "photobooth_needed",
    label: "Photobooth",
    phase: "PHASE_CELEBRATION",
    bookedResponse: "yes",
  },
  {
    id: "fireworks_needed",
    label: "Fuegos artificiales",
    phase: "PHASE_CELEBRATION",
    bookedResponse: "yes",
  },
  {
    id: "band_music_needed",
    label: "Banda de musica",
    phase: "PHASE_CELEBRATION",
    bookedResponse: "yes",
  },
  {
    id: "dj_music_needed",
    label: "DJ",
    phase: "PHASE_CELEBRATION",
    bookedResponse: "yes",
  },
  {
    id: "dancing_instructor_needed",
    label: "Profesor de baile",
    phase: "PHASE_CELEBRATION",
    bookedResponse: "yes",
  },
  {
    id: "bakery_needed",
    label: "Tarta nupcial",
    phase: "PHASE_CELEBRATION",
    bookedResponse: "yes",
  },
  {
    id: "barra_libre",
    label: "Barra libre",
    phase: "PHASE_CELEBRATION",
    bookedResponse: "yes",
  },
];

/**
 * Default questions to analyze if none are specified
 */
export const DEFAULT_ENTRY_POINT_QUESTION_IDS = [
  "ceremony_venue_booked",
  "venue_search_started",
  "photographer_booked",
];

/**
 * Get questions by their IDs
 */
export function getQuestionsByIds(ids: string[]): EntryPointQuestion[] {
  return AVAILABLE_ENTRY_POINT_QUESTIONS.filter((q) => ids.includes(q.id));
}

/**
 * Get a question by ID
 */
export function getQuestionById(id: string): EntryPointQuestion | undefined {
  return AVAILABLE_ENTRY_POINT_QUESTIONS.find((q) => q.id === id);
}
