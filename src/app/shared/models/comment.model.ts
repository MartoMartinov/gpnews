import { User } from './user.model';

/** A comment on an article. Replies are one level deep. */
export interface Comment {
  id: string;
  user: User;
  text: string;
  /** Minutes since posted. */
  ago: number;
  likes: number;
  liked: boolean;
  replies: Comment[];
}
