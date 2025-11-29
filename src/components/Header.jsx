// src/components/Header.jsx
import React from "react";
import "./Header.css";

export default function Header({ user }) {
  return (
    <header className="header">
      <h1 className="header-title">Sistema Escolar</h1>

      {user && (
            <p className="usuario-logado">
              👤 Logado como: <strong>{user.email}</strong> ({user.tipo_usuario})
            </p>
          )}
    </header>
  );
}
