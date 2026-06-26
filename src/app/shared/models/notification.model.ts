/** An in-app notification (известие). */
export interface AppNotification {
  id: string;
  title: string;
  /** Bulgarian relative time, e.g. "12 месеца". */
  ago: string;
  /** ISO 8601 date. */
  iso: string;
  read: boolean;
  /** Article id to open when tapped, if any. */
  art?: string;
}
