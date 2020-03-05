import {Injectable} from '@angular/core';
import {UserAuth} from '../../shared/types/UserAuth';
import {Project} from '../../shared/types/Project';
import {Embedding} from 'src/app/shared/types/tasks/Embedding';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() {
  }

  public getUser(): UserAuth | null {
    const user = localStorage.getItem('user');
    if (user) {
      return JSON.parse(user);
    }
    return null;
  }

  public deleteUser(): void {
    localStorage.removeItem('user');
  }

  public setUser(value: UserAuth) {
    localStorage.setItem('user', JSON.stringify(value));
  }

  public getCurrentlySelectedProject(): Project | null {
    const selectedProject = localStorage.getItem('selectedProject');
    if (selectedProject) {
      return JSON.parse(selectedProject);
    }
    return null;
  }

  public setCurrentlySelectedProject(value: Project | null) {
    localStorage.setItem('selectedProject', JSON.stringify(value));
  }

  public setLexiconMinerEmbeddingId(embeddingId: number) {
    localStorage.setItem('lexiconMinerEmbedding', JSON.stringify(embeddingId));
  }

  public getLexiconMinerEmbeddingId(): number | null {
    const lexiconEmbedding = localStorage.getItem('lexiconMinerEmbedding');
    if (lexiconEmbedding) {
      return JSON.parse(lexiconEmbedding);
    }
    return null;
  }

  public deleteLexiconMinerEmbeddingId() {
    localStorage.removeItem('lexiconMinerEmbedding');
  }
}
