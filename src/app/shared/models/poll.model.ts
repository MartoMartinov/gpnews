/** A single poll option. */
export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

/** A poll (анкета). */
export interface Poll {
  id: string;
  title: string;
  question: string;
  options: PollOption[];
  /** Option id the current user voted for, or null. */
  voted: string | null;
  total: number;
  /** Bulgarian status text, e.g. "Затваря след 5 дни". */
  closes: string;
}
