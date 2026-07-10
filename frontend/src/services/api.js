import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((req) => {
    const token = localStorage.getItem("token");
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export const register = (data) => API.post("/auth/register", data);
export const login = (data) => API.post("/auth/login", data);
export const getNearbyMatches = (params) => API.get('/posts/nearby', { params })
export const getPosts = () => API.get("/posts");
export const getPostById = (id) => API.get(`/posts/${id}`);
export const searchPosts = (params) => API.get(`/posts/search`, { params });
export const createPost = (data) => API.post('/posts', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
})
export const getMyPosts = () => API.get("/posts/my-posts");
export const getSimilarPosts = (id) => API.get(`/posts/${id}/similar`)