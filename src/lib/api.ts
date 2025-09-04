// API utility functions for authenticated requests

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const api = {
  get: async (url: string) => {
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return response;
  },

  post: async (url: string, data: any) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response;
  },

  put: async (url: string, data: any) => {
    const response = await fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response;
  },

  delete: async (url: string, data?: any) => {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      ...(data && { body: JSON.stringify(data) }),
    });
    return response;
  },
};
