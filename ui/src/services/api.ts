// API client without React hooks
// Get base URL and ensure HTTPS if page is served over HTTPS
const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  
  // Runtime fix: If page is HTTPS and API URL is HTTP, upgrade to HTTPS
  // This prevents mixed content errors even if build has wrong value
  if (
    typeof window !== 'undefined' &&
    window.location.protocol === 'https:' &&
    envUrl.startsWith('http://') &&
    !envUrl.includes('localhost')
  ) {
    const upgradedUrl = envUrl.replace('http://', 'https://');
    return upgradedUrl;
  }
  
  return envUrl;
};

const API_BASE_URL = getApiBaseUrl();

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: Response
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Token management - get tokens from localStorage to stay in sync with AuthContext
const getAuthTokens = () => {
  const stored = localStorage.getItem('auth_tokens');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      // Invalid token format, clear it
      localStorage.removeItem('auth_tokens');
      return null;
    }
  }
  return null;
};

const setAuthTokens = (tokens: {
  access_token: string;
  refresh_token: string;
  token_type?: string;
}) => {
  localStorage.setItem('auth_tokens', JSON.stringify(tokens));
};

const clearAuthTokens = () => {
  localStorage.removeItem('auth_tokens');
};

// Handle session expiration globally
const handleSessionExpired = () => {
  // Clear tokens
  clearAuthTokens();

  // Dispatch custom event to notify AuthContext
  window.dispatchEvent(
    new CustomEvent('session-expired', {
      detail: { message: 'Your session has expired. Please log in again.' },
    })
  );
};

// Request helper
const makeRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  // Ensure URL is HTTPS if page is HTTPS (runtime safety check)
  let baseUrl = API_BASE_URL;
  if (
    typeof window !== 'undefined' &&
    window.location.protocol === 'https:' &&
    baseUrl.startsWith('http://') &&
    !baseUrl.includes('localhost')
  ) {
    baseUrl = baseUrl.replace('http://', 'https://');
  }
  
  const url = `${baseUrl}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const tokens = getAuthTokens();
  if (tokens?.access_token) {
    headers.Authorization = `Bearer ${tokens.access_token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired, try to refresh only once
      try {
        await refreshAccessToken();
        // Retry the request with new token
        const newTokens = getAuthTokens();
        if (newTokens?.access_token) {
          headers.Authorization = `Bearer ${newTokens.access_token}`;
          const retryResponse = await fetch(url, {
            ...options,
            headers,
          });
          if (retryResponse.ok) {
            return retryResponse;
          }
          // If retry still fails with 401, session is expired
          if (retryResponse.status === 401) {
            handleSessionExpired();
            throw new ApiError(
              'Session expired. Please log in again.',
              401,
              retryResponse
            );
          }
        }
      } catch (refreshError) {
        // If refresh failed, session is expired
        handleSessionExpired();
        const errorMessage =
          refreshError instanceof Error
            ? refreshError.message
            : 'Token refresh failed';
        throw new ApiError(
          `Session expired: ${errorMessage}. Please log in again.`,
          401,
          response
        );
      }
    }
    throw new ApiError(
      `Request failed: ${response.statusText}`,
      response.status,
      response
    );
  }

  return response;
};

// Token refresh - simplified to just make the request
const refreshAccessToken = async () => {
  const tokens = getAuthTokens();
  if (!tokens?.refresh_token) {
    throw new Error('No refresh token available');
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: tokens.refresh_token }),
  });

  if (!response.ok) {
    // If refresh fails, session is expired
    handleSessionExpired();
    throw new Error('Token refresh failed - session expired');
  }

  const tokenData = await response.json();
  // Update localStorage directly - AuthContext will pick this up
  localStorage.setItem('auth_tokens', JSON.stringify(tokenData));
  return tokenData;
};

export const createApiClient = () => {
  // Authentication methods
  const login = async (credentials: { email: string; password: string }) => {
    const response = await makeRequest('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    const tokenData = await response.json();
    // Don't manage tokens here - let AuthContext handle it
    return tokenData;
  };

  const register = async (credentials: {
    email: string;
    username: string;
    password: string;
  }) => {
    const response = await makeRequest('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    const tokenData = await response.json();
    setAuthTokens(tokenData);
    return tokenData;
  };

  const logoutUser = async () => {
    try {
      await makeRequest('/api/v1/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      // Logout should always clear local state even if API call fails
    } finally {
      clearAuthTokens();
    }
  };

  // Project Management
  const getProjects = async (): Promise<any[]> => {
    const response = await makeRequest('/api/v1/projects/');
    return response.json();
  };

  const getProject = async (projectId: number) => {
    const response = await makeRequest(`/api/v1/projects/${projectId}`);
    return response.json();
  };

  const createProject = async (projectData: Partial<any>) => {
    const response = await makeRequest('/api/v1/projects/', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
    return response.json();
  };

  const updateProject = async (
    projectId: number,
    projectData: Partial<any>
  ) => {
    const response = await makeRequest(`/api/v1/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
    return response.json();
  };

  const deleteProject = async (projectId: number) => {
    const response = await makeRequest(`/api/v1/projects/${projectId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `Failed to delete project: ${response.status}`
      );
    }

    return true;
  };

  // Document Management - Documents are included in project response
  // const getDocuments = async (projectId: number) => {
  //   const response = await makeRequest(`/api/v1/projects/${projectId}/documents`);
  //   return response.json();
  // };

  const createDocument = async (
    projectId: number,
    documentData: Partial<any>
  ) => {
    const response = await makeRequest(
      `/api/v1/projects/${projectId}/documents`,
      {
        method: 'POST',
        body: JSON.stringify(documentData),
      }
    );
    return response.json();
  };

  const createDocumentsBulk = async (
    projectId: number,
    documentsData: Partial<any>[]
  ) => {
    const response = await makeRequest(
      `/api/v1/projects/${projectId}/documents/bulk`,
      {
        method: 'POST',
        body: JSON.stringify(documentsData),
      }
    );
    return response.json();
  };

  const updateDocument = async (
    projectId: number,
    documentId: number,
    documentData: Partial<any>
  ) => {
    const response = await makeRequest(
      `/api/v1/projects/${projectId}/documents/${documentId}`,
      {
        method: 'PUT',
        body: JSON.stringify(documentData),
      }
    );
    return response.json();
  };

  const deleteDocument = async (projectId: number, documentId: number) => {
    const response = await makeRequest(
      `/api/v1/projects/${projectId}/documents/${documentId}`,
      {
        method: 'DELETE',
      }
    );
    return response.ok;
  };

  const deleteAllDocuments = async (projectId: number) => {
    const response = await makeRequest(
      `/api/v1/projects/${projectId}/documents`,
      {
        method: 'DELETE',
      }
    );
    return response.json();
  };

  // AIANO Block Management
  const createAianoBlock = async (
    projectId: number,
    blockData: Partial<any>
  ) => {
    const response = await makeRequest(
      `/api/v1/projects/${projectId}/aiano-blocks`,
      {
        method: 'POST',
        body: JSON.stringify(blockData),
      }
    );
    return response.json();
  };

  const getAianoBlocks = async (projectId: number): Promise<any[]> => {
    const response = await makeRequest(
      `/api/v1/projects/${projectId}/aiano-blocks`
    );
    return response.json();
  };

  const updateAianoBlock = async (
    projectId: number,
    blockId: number,
    blockData: Partial<any>
  ) => {
    const response = await makeRequest(
      `/api/v1/projects/${projectId}/aiano-blocks/${blockId}`,
      {
        method: 'PUT',
        body: JSON.stringify(blockData),
      }
    );
    return response.json();
  };

  const deleteAianoBlock = async (projectId: number, blockId: number) => {
    const response = await makeRequest(
      `/api/v1/projects/${projectId}/aiano-blocks/${blockId}`,
      {
        method: 'DELETE',
      }
    );
    return response.ok;
  };

  // Highlight Management
  const createHighlight = async (
    projectId: number,
    documentId: number,
    highlightData: Partial<any>
  ) => {
    const response = await makeRequest(
      `/api/v1/projects/${projectId}/documents/${documentId}/highlights`,
      {
        method: 'POST',
        body: JSON.stringify(highlightData),
      }
    );
    return response.json();
  };

  const getHighlights = async (projectId: number, documentId: number) => {
    const response = await makeRequest(
      `/api/v1/projects/${projectId}/documents/${documentId}/highlights`
    );
    return response.json();
  };

  const updateHighlight = async (
    projectId: number,
    documentId: number,
    highlightId: number,
    highlightData: Partial<any>
  ) => {
    const response = await makeRequest(
      `/api/v1/projects/${projectId}/documents/${documentId}/highlights/${highlightId}`,
      {
        method: 'PUT',
        body: JSON.stringify(highlightData),
      }
    );
    return response.json();
  };

  const deleteHighlight = async (
    projectId: number,
    documentId: number,
    highlightId: number
  ) => {
    const response = await makeRequest(
      `/api/v1/projects/${projectId}/documents/${documentId}/highlights/${highlightId}`,
      {
        method: 'DELETE',
      }
    );
    return response.ok;
  };

  // Session Management
  const createProjectSession = async (
    projectId: number,
    sessionData: Partial<any>
  ) => {
    const response = await makeRequest(
      `/api/v1/projects/${projectId}/sessions`,
      {
        method: 'POST',
        body: JSON.stringify(sessionData),
      }
    );
    return response.json();
  };

  const getProjectSessions = async (projectId: number) => {
    const response = await makeRequest(
      `/api/v1/projects/${projectId}/sessions`
    );
    return response.json();
  };

  const getActiveProjectSession = async (projectId: number) => {
    const response = await makeRequest(
      `/api/v1/projects/${projectId}/sessions/active`
    );
    return response.json();
  };

  const updateProjectSession = async (
    projectId: number,
    sessionId: number,
    sessionData: Partial<any>
  ) => {
    const response = await makeRequest(
      `/api/v1/projects/${projectId}/sessions/${sessionId}`,
      {
        method: 'PUT',
        body: JSON.stringify(sessionData),
      }
    );
    return response.json();
  };

  const deleteProjectSession = async (projectId: number, sessionId: number) => {
    const response = await makeRequest(
      `/api/v1/projects/${projectId}/sessions/${sessionId}`,
      {
        method: 'DELETE',
      }
    );
    return response.ok;
  };

  // Export and Import
  const exportProject = async (projectId: number, exportOptions: any = {}) => {
    const response = await makeRequest(`/api/v1/projects/${projectId}/export`, {
      method: 'POST',
      body: JSON.stringify(exportOptions),
    });
    return response.json();
  };

  const importProject = async (projectData: any) => {
    const response = await makeRequest('/api/v1/projects/import', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
    return response.json();
  };

  // Complete Project State
  const getCompleteProjectState = async (projectId: number) => {
    // Note: The backend returns complete project state from the main project endpoint
    const response = await makeRequest(`/api/v1/projects/${projectId}`);
    return response.json();
  };

  // State Management
  const saveProjectState = async (projectId: number, state: any) => {
    // Save complete project state
    const sessionData = {
      project_id: projectId,
      session_name: 'Auto-save',
      selected_document_id: state.selectedDocument?.id,
      active_highlights: state.activeHighlights,
      view_state: state.viewState,
    };

    try {
      return await createProjectSession(projectId, sessionData);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to save project state: ${errorMessage}`);
    }
  };

  const loadProjectState = async (projectId: number) => {
    // Load complete project state
    try {
      return await getCompleteProjectState(projectId);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to load project state: ${errorMessage}`);
    }
  };

  // Annotation Entry Management
  const createAnnotationEntry = async (
    projectId: number,
    entryData: {
      project_id: number;
      document_id: number;
      entry_data: any;
      entry_name?: string;
      entry_notes?: string;
    }
  ) => {
    const response = await makeRequest(
      `/api/v1/projects/${projectId}/entries`,
      {
        method: 'POST',
        body: JSON.stringify(entryData),
      }
    );
    return response.json();
  };

  const getAnnotationEntries = async (projectId: number) => {
    const response = await makeRequest(`/api/v1/projects/${projectId}/entries`);
    return response.json();
  };

  const getAnnotationEntry = async (projectId: number, entryId: number) => {
    const response = await makeRequest(
      `/api/v1/projects/${projectId}/entries/${entryId}`
    );
    return response.json();
  };

  const deleteAnnotationEntry = async (projectId: number, entryId: number) => {
    const response = await makeRequest(
      `/api/v1/projects/${projectId}/entries/${entryId}`,
      {
        method: 'DELETE',
      }
    );
    return response.ok;
  };

  const deleteAllAnnotationEntries = async (projectId: number) => {
    const response = await makeRequest(
      `/api/v1/projects/${projectId}/entries`,
      {
        method: 'DELETE',
      }
    );
    return response.json();
  };

  return {
    // Authentication
    login,
    register,
    logout: logoutUser,

    // Projects
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,

    // Documents
    // getDocuments, // Removed - documents are included in project response
    createDocument,
    createDocumentsBulk,
    updateDocument,
    deleteDocument,
    deleteAllDocuments,

    // AIANO Blocks
    createAianoBlock,
    getAianoBlocks,
    updateAianoBlock,
    deleteAianoBlock,

    // Highlights
    createHighlight,
    getHighlights,
    updateHighlight,
    deleteHighlight,

    // Sessions
    createProjectSession,
    getProjectSessions,
    getActiveProjectSession,
    updateProjectSession,
    deleteProjectSession,

    // Export/Import
    exportProject,
    importProject,

    // State Management
    getCompleteProjectState,
    saveProjectState,
    loadProjectState,

    // Annotation Entries
    createAnnotationEntry,
    getAnnotationEntries,
    getAnnotationEntry,
    deleteAnnotationEntry,
    deleteAllAnnotationEntries,

    // Utility
    makeRequest,
  };
};

export const apiClient = createApiClient();
