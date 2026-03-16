import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState, createContext, useContext } from "react";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import UserList from "./pages/UserList";
import TasksByTags from "./pages/TasksByTags";
import Preferences from "./pages/Preferences";
import ShoppingList from "./pages/ShoppingList";
import Layout from "./components/Layout";
import useApi from "./hooks/useApi";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { api } = useApi(); // Need to expose api instance or use fetch

  useEffect(() => {
    // Check session
    const checkAuth = async () => {
      try {
        // We need to use the api instance from useApi, but useApi returns an object of functions.
        // Let's just use axios directly or modify useApi to expose the instance?
        // Or just call a method like getUser('me')? But getUser takes an ID.
        // Let's add checkSession to useApi or just fetch here.
        // Actually, let's use fetch for simplicity or import axios.
        // Better yet, let's update useApi to include checkSession.
        // For now, I'll assume I can add checkSession to useApi in a moment.
        // Wait, I can't edit useApi in parallel easily.
        // Let's just use the fetch API for the auth check to avoid circular deps or complex refactors right now.
        const response = await fetch('http://localhost:3000/api/auth/me', { credentials: 'include' });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (e) {
        console.error("Not authenticated");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<UserList />} />
          <Route path="tasks" element={<TasksByTags />} />
          <Route path="shopping" element={<ShoppingList />} />
          <Route path="preferences" element={<Preferences />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
