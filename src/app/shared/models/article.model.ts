import { User } from './user.model';

export interface SubmitArticleData {
  cat: string;
  title: string;
  body: string;
}

/** A news article. */
export interface Article {
  id: string;
  /** Category id. */
  cat: string;
  title: string;
  /** Bulgarian formatted date, e.g. "17 октомври 2024". */
  date: string;
  /** ISO 8601 date. */
  iso: string;
  /** Image placeholder key, or 'upload' for user-submitted. */
  img: string;
  /** Full article body as a single HTML string (rich text). */
  content: string;
  tags: string[];
  author?: User;
  /** Whether the article is submitted and awaiting moderation. */
  pending?: boolean;
  /** Number of top-level + reply comments (returned by list endpoints). */
  commentCount?: number;
}
