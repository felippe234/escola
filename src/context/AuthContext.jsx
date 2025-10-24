import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email, senha) => {
    try {
      const response = await fetch("http://localhost:4005/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      if (!response.ok) {
        const err = await response.json();
        return { success: false, error: err.erro || "Erro no login" };
      }

      const data = await response.json();
      setUser(data.usuario);
      localStorage.setItem("user", JSON.stringify(data.usuario));
      console.log(data.usuario);
      return { success: true, user: data.usuario };
    } catch (error) {
      console.error("Erro na conexão:", error);
      return { success: false, error: "Falha de conexão com servidor" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
