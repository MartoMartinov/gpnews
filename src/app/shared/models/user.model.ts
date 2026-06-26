/** A user / author in the system. */
export interface User {
  id: string;
  name: string;
  initials: string;
  email?: string;
  /** Whether this is an official G.P. News editorial account. */
  official?: boolean;
}
