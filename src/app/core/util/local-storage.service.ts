import {Injectable} from '@angular/core';
import {UserAuth} from '../../shared/types/UserAuth';
import {Project, ProjectState} from '../../shared/types/Project';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() {
  }

  public updateProjectState(project: Project, state: ProjectState) {
    if (project?.id) {
      localStorage.setItem('projectState' + project.id, JSON.stringify(state));
    }
  }

  public getProjectState(project: Project): ProjectState | null {
    if (project?.id) {
      const state = localStorage.getItem('projectState' + project.id);
      if (state) {
        return JSON.parse(state);
      } else {
        return {
          searcher: {
            itemsPerPage: 10,
            selectedFields: []
          },
          models: {
            tagger: {itemsPerPage: 25},
            embedding: {itemsPerPage: 25},
            torchTagger: {itemsPerPage: 25},
            taggerGroup: {itemsPerPage: 25}
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

}
