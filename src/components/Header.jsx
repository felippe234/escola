// src/components/Header.jsx
import React from "react";
import "./Header.css";

export default function Header({ user }) {
  return (
    <header className="header">
      <h1 className="header-title">Sistema Escolar</h1>

      {user && (
        <div className="user-info">
          <p className="user-name">{user.nome}</p>
          <span className="user-role">
            {user.tipo_usuario === "aluno"
              ? "🎓 Aluno"
              : user.tipo_usuario === "professor"
              ? "🧑‍🏫 Professor"
              : "⚙️ Admin"}
          </span>
        </div>
      )}
    </header>
  );
}
