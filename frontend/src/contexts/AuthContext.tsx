import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import api from "../services/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setAuthData: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserFromToken = useCallback(async (storedToken: string) => {
    try {
      const response = await api.get("/users/me", {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      setUser(response.data);
      setToken(storedToken);
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setToken(null);
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    
    if (storedToken) {
      loadUserFromToken(storedToken).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [loadUserFromToken]);

  const login = async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    const { user: userData, token: userToken } = response.data;

    localStorage.setItem("token", userToken);
    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);
    setToken(userToken);
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await api.post("/auth/register", { name, email, password });
    const { user: userData, token: userToken } = response.data;

    localStorage.setItem("token", userToken);
    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);
    setToken(userToken);
  };

  const setAuthData = async (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);

    try {
      const response = await api.get("/users/me", {
        headers: { Authorization: `Bearer ${newToken}` },
      });
      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        setAuthData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
