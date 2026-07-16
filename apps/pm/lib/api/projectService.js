import strapiClient from '../strapiClient';

/** Fast detail fetch — task id/status only (full task rows load via /tasks). */
const PROJECT_DETAIL_POPULATE = {
  'populate[projectManager]': '*',
  'populate[teamMembers]': '*',
  'populate[clientAccount]': '*',
  'populate[tasks][fields][0]': 'id',
  'populate[tasks][fields][1]': 'status',
};

/** Legacy heavy populate — avoid on detail page; loads every task relation. */
const PROJECT_FULL_TASKS_POPULATE = {
  ...PROJECT_DETAIL_POPULATE,
  'populate[tasks][populate][assignee]': '*',
  'populate[tasks][populate][assigner]': '*',
  'populate[tasks][populate][collaborators]': '*',
  'populate[tasks][populate][subtasks]': '*',
};

function normalizeProjectFetchOptions(options) {
  if (options === false) return { populate: false, fullTasks: false };
  if (options === true) return { populate: true, fullTasks: false };
  if (typeof options === 'object' && options !== null) {
    return {
      populate: options.populate !== false,
      fullTasks: Boolean(options.fullTasks),
    };
  }
  return { populate: true, fullTasks: false };
}

function projectPopulateParams(options) {
  const { populate, fullTasks } = normalizeProjectFetchOptions(options);
  if (!populate) return {};
  return fullTasks ? PROJECT_FULL_TASKS_POPULATE : PROJECT_DETAIL_POPULATE;
}

class ProjectService {
  async getAllProjects(options = {}) {
    try {
      const params = {
        'pagination[page]': options.page || 1,
        'pagination[pageSize]': options.pageSize || 25,
        'sort': options.sort || 'updatedAt:desc',
        'populate[projectManager]': '*',
        'populate[teamMembers]': '*',
        'populate[tasks][fields][0]': 'id',
        'populate[tasks][fields][1]': 'status',
        'populate[clientAccount][fields][0]': 'id',
        'populate[clientAccount][fields][1]': 'companyName',
        'populate[clientAccount][fields][2]': 'status',
      };

      if (options.status) {
        params['filters[status][$eq]'] = options.status;
      }
      if (options.userId) {
        params['filters[$or][0][projectManager][id][$eq]'] = options.userId;
        params['filters[$or][1][teamMembers][id][$eq]'] = options.userId;
      }
      if (options.ownerId) {
        params['filters[projectManager][id][$eq]'] = options.ownerId;
      }
      if (options.search) {
        params['filters[$or][0][name][$containsi]'] = options.search;
        params['filters[$or][1][description][$containsi]'] = options.search;
      }

      return await strapiClient.get('/projects', params);
    } catch (error) {
      console.error('Error fetching projects:', error);
      return { data: [], meta: { pagination: { total: 0 } } };
    }
  }

  async getProjectById(id, options = true) {
    try {
      const params = projectPopulateParams(options);
      return await strapiClient.get(`/projects/${id}`, params);
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      throw error;
    }
  }

  async getProjectBySlug(slug, options = true) {
    try {
      const params = {
        'filters[slug][$eq]': slug,
        'pagination[pageSize]': 1,
        ...projectPopulateParams(options),
      };
      const response = await strapiClient.get('/projects', params);
      const items = response?.data || [];
      if (items.length === 0) throw new Error('Project not found');
      return { data: items[0] };
    } catch (error) {
      console.error(`Error fetching project by slug ${slug}:`, error);
      throw error;
    }
  }

  async createProject(projectData) {
    try {
      return await strapiClient.post('/projects', { data: projectData });
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  async updateProject(id, projectData) {
    try {
      return await strapiClient.put(`/projects/${id}`, { data: projectData });
    } catch (error) {
      console.error(`Error updating project ${id}:`, error);
      throw error;
    }
  }

  async deleteProject(id) {
    try {
      return await strapiClient.delete(`/projects/${id}`);
    } catch (error) {
      console.error(`Error deleting project ${id}:`, error);
      throw error;
    }
  }

  async addTeamMember(projectId, userId) {
    try {
      const project = await this.getProjectById(projectId);
      const existing = (project?.data?.teamMembers?.data || project?.data?.teamMembers || []).map((m) => m.id || (m.attributes || m).id);
      if (!existing.includes(userId)) {
        return this.updateProject(projectId, { teamMembers: [...existing, userId] });
      }
      return project;
    } catch (error) {
      console.error('Error adding team member:', error);
      throw error;
    }
  }

  async removeTeamMember(projectId, userId) {
    try {
      const project = await this.getProjectById(projectId);
      const existing = (project?.data?.teamMembers?.data || project?.data?.teamMembers || []).map((m) => m.id || (m.attributes || m).id);
      return this.updateProject(projectId, { teamMembers: existing.filter((id) => id !== userId) });
    } catch (error) {
      console.error('Error removing team member:', error);
      throw error;
    }
  }

  async searchProjects(query, options = {}) {
    try {
      const params = {
        'pagination[page]': 1,
        'pagination[pageSize]': options.pageSize || 10,
        'filters[$or][0][name][$containsi]': query,
        'filters[$or][1][description][$containsi]': query,
        'populate[projectManager][fields][0]': 'firstName',
        'populate[projectManager][fields][1]': 'lastName',
      };
      return await strapiClient.get('/projects', params);
    } catch (error) {
      console.error('Error searching projects:', error);
      return { data: [] };
    }
  }

  async getProjectsByStatus(status, options = {}) {
    return this.getAllProjects({ ...options, status });
  }

  async getProjectsByUser(userId, options = {}) {
    return this.getAllProjects({ ...options, userId });
  }

  /** Client accounts in the org for project client dropdown (PM projects read). */
  async getProjectClientOptions() {
    try {
      const res = await strapiClient.get('/projects/client-options');
      return Array.isArray(res?.data) ? res.data : [];
    } catch (error) {
      console.error('Error fetching project client options:', error);
      return [];
    }
  }
}

export default new ProjectService();
