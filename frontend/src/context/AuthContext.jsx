import { createContext, useState, useContext } from "react";
import axios from "axios";
const API = axios.create({ baseURL: 'https://fyndhub.onrender.com/api' })


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [loading, setLoading] = useState(false);


    const register = async (data) => {
        try {
            const res = await API.post("/auth/register", data);
            setToken(res.data.token);
            localStorage.setItem("token", res.data.token);
            setUser(res.data.user);
            return res.data;
        } catch (err) {
            throw err;
        }
    };

    const loginUser = async (data) => {
        try {
            const res = await API.post("/auth/login", data);
            setToken(res.data.token);
            localStorage.setItem("token", res.data.token);
            setUser(res.data.user);
            return res.data;
        } catch (err) {
            throw err;
        }
    };

    const logoutUser = () => {
        setToken(null);
        localStorage.removeItem("token");
        setUser(null);
    };

    const value = {
        user,
        token,
        loading,
        register,
        loginUser,
        logoutUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
export const useAuth = () => useContext(AuthContext);