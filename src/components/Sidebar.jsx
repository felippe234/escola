// src/components/Sidebar.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';
import logo from '../assets/logo.png';

import {
  LayoutDashboard,
  Users,
  UserCheck,
  GraduationCap,
  FileSpreadsheet,
  Megaphone,
  LogOut,
  ChevronLeft, // ✅ IMPORTADO AQUI
} from "lucide-react";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", path: "/dashboard" },
    { icon: <Users size={20} />, label: "Alunos", path: "/alunos" },
    { icon: <UserCheck size={20} />, label: "Professores", path: "/professores" },
    { icon: <GraduationCap size={20} />, label: "Turmas", path: "/turmas" },
    { icon: <FileSpreadsheet size={20} />, label: "Avaliações", path: "/avaliacoes" },
    { icon: <Megaphone size={20} />, label: "Comunicados", path: "/comunicados" },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      
      {/* Botão de collapse – aparece só quando aberto */}
      {!collapsed && (
        <button
          className="collapse-btn"
          onClick={() => setCollapsed(true)}
          aria-label="Fechar menu"
        >
          <ChevronLeft size={18} />
        </button>
      )}

      {/* Logo */}
      {!collapsed && (
        <h2 className="sidebar-logo">
          <img src={logo} alt="Logo da Escola" className="sidebar-logo-img" />
        </h2>
      )}

      {/* Navegação */}
      <nav className="sidebar-nav">
        {menuItems.map((item, index) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={index}
              to={item.path}
              className={`sidebar-link ${active ? 'active' : ''}`}
              onClick={() => setCollapsed(false)} // ✅ Abre menu ao clicar
            >
              <span className="emoji-icon">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Rodapé - Logout */}
      <div className="sidebar-footer" onClick={handleLogout}>
        <LogOut size={20} />
        {!collapsed && <span>Sair</span>}
      </div>
    </aside>
  );
};

export default Sidebar;
