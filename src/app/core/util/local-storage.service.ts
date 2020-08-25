import {Injectable} from '@angular/core';
import {UserAuth} from '../../shared/types/UserAuth';
import {Project, ProjectState} from '../../shared/types/Project';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() {
  }

  public updateProjectState(project: Project | number, state: ProjectState): void {
    const projectId = typeof project === 'number' ? project : project.id;
    if (projectId) {
      localStorage.setItem('projectState' + projectId, JSON.stringify(state));
    }
  }

  public getProjectState(project: Project | number): ProjectState | null {
    const projectId = typeof project === 'number' ? project : project.id;
    if (projectId) {
      const state = localStorage.getItem('projectState' + projectId);
      if (state) {
        return JSON.parse(state);
      } else {
        return {
          searcher: {
            itemsPerPage: 10,
            selectedFields: [],
            searcherType: 1
          },
          models: {
            tagger: {itemsPerPage: 25},
            embedding: {itemsPerPage: 25},
            torchTagger: {itemsPerPage: 25},
            taggerGroup: {itemsPerPage: 25},
            clustering: {}
          },
          tasks: {},
          lexicons: {embeddingId: null},
          global: {selectedIndices: []}
        };
      }
    }
    return null;
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
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  // public logoutUser(): void {
    //TODO
  //   this.deleteUser();
  //   // Manually logging out should also remove the refresh_token, but it shouldn't be removed 
  //   localStorage.removeItem('refresh_token');
  // }

  public setUser(value: UserAuth): void {
    localStorage.setItem('user', JSON.stringify(value));
  }

  public setOAuthAccessToken(value: string): void {
    localStorage.setItem('access_token', value);
  }

  public setOAuthRefreshToken(value: string): void {
    localStorage.setItem('refresh_token', value);
  }

  public getOAuthAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  public getOAuthRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  public getCurrentlySelectedProject(): Project | null {
    const selectedProject = localStorage.getItem('selectedProject');
    if (selectedProject) {
      return JSON.parse(selectedProject);
    }
    return null;
  }

  public setCurrentlySelectedProject(value: Project | null): void {
    localStorage.setItem('selectedProject', JSON.stringify(value));
  }

}
