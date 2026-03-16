import axios from "axios";

const useApi = () => {
    const api = axios.create({
        baseURL: 'http://localhost:3000/api',
        withCredentials: true // Send cookies with requests
    });

    return {
        getTasks: (params) => api.get('/tasks', { params }),
        createTask: (data) => api.post('/tasks', data),
        updateTask: (id, data) => api.put(`/tasks/${id}`, data),
        deleteTask: (id) => api.delete(`/tasks/${id}`),
        duplicateTask: (id, newTitle) => api.post(`/tasks/${id}/duplicate`, { title: newTitle }),
        getUsers: () => api.get('/users'),
        getUser: (id) => api.get(`/users/${id}`),
        updateUser: (id, data) => api.put(`/users/${id}`, data),
        deleteUser: (id) => api.delete(`/users/${id}`),
        getTags: () => api.get('/tags'),
        createTag: (data) => api.post('/tags', data),
        updateTag: (id, data) => api.put(`/tags/${id}`, data),
        deleteTag: (id) => api.delete(`/tags/${id}`),
        getShoppingItems: () => api.get('/shopping'),
        createShoppingItem: (data) => api.post('/shopping', data),
        updateShoppingItem: (id, data) => api.put(`/shopping/${id}`, data),
        deleteShoppingItem: (id) => api.delete(`/shopping/${id}`),
        getShoppingSuggestions: () => api.get('/shopping/suggestions'),
    };
};

export default useApi;
