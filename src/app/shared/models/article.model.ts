import { User } from './user.model';

/** True when `img` is an uploaded photo (data URI or URL) rather than a legacy placeholder key. */
export function isPhotoImg(img: string | undefined | null): img is string {
  return !!img && /^(data:|https?:\/\/|\/)/.test(img);
}

export interface SubmitArticleData {
  cat: string;
  title: string;
  body: string;
  /** Optional cover photo as a base64 data URI. */
  img?: string;
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

/** Lightweight article shape used by the home screen preview (no content/tags/author). */
export interface ArticlePreview {
  id: string;
  /** Category id. */
  cat: string;
  title: string;
  date: string;
  /** Image placeholder key, or an uploaded photo (data URI/URL) — see {@link isPhotoImg}. */
  img?: string;
  commentCount?: number;
}

/** One category's home-screen preview: a lead article plus a couple more. */
export interface HomeSection {
  catId: string;
  lead: ArticlePreview;
  more: ArticlePreview[];
}
