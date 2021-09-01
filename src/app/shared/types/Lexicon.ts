
// tslint:disable:variable-name
import {UserProfile} from './UserProfile';

export class Lexicon {
  id: number;
  author: UserProfile;
  description: string;
  positives_used: string[];
  negatives_used: string[];
  positives_unused: string[];
  negatives_unused: string[];

}
