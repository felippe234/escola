// src/pages/TurmasPage.jsx
import NewAlunoModal from "../components/Modals/NewAlunoModal";

import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import "./TurmasPage.css";

export default function TurmasPage() {
  const { user } = useAuth();
  const [turmas, setTurmas] = useState([]);
  const [alunos, setAlunos] = useState({});

  // Estados dos modais
  const [showTurmaModal, setShowTurmaModal] = useState(false);
  const [showAlunoModal, setShowAlunoModal] = useState(false);
  const [turmaSelecionada, setTurmaSelecionada] = useState(null);

  // Dados dos formulários
  const [novaTurma, setNovaTurma] = useState({
    nome: "",
    ano_letivo: "",
    turno: "",
    sala: "",
  });

  
  useEffect(() => {
    fetch("http://localhost:4004/turmas")
      .then((res) => res.json())
      .then((data) => setTurmas(data));
  }, []);

  const isAdmin = user?.tipo_usuario === "admin";
  const isAluno = user?.tipo_usuario === "aluno";

  // Função para carregar alunos
  const carregarAlunos = async (turmaId) => {
    const res = await fetch(`http://localhost:4004/turmas/${turmaId}/alunos`);
    const data = await res.json();
    console.log(data);
    setAlunos({ ...alunos, [turmaId]: data });
  };

  // CRUD Turma
  const handleAddTurma = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:4004/turmas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...novaTurma, status: "Ativa" }),
    });
    const data = await res.json();
    setTurmas([...turmas, data]);
    setShowTurmaModal(false);
    setNovaTurma({ nome: "", ano_letivo: "", turno: "", sala: "" });
  };

  const handleDeleteTurma = async (id) => {
    await fetch(`http://localhost:4004/turmas/${id}`, { method: "DELETE" });
    setTurmas(turmas.filter((t) => t.id !== id));
  };

  // CRUD Aluno em turma
  

  const handleEditAluno = async (alunoId, turmaId) => {
    const nome = prompt("Novo nome:");
    
    if (!nome) return;

    const res = await fetch(`http://localhost:4001/alunos/${alunoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome }),
    });
     await res.json();

   carregarAlunos(turmaId);
  };

  const handleDeleteAluno = async (alunoId, turmaId) => {
    await fetch(`http://localhost:4004/turmas/${turmaId}/alunos/${alunoId}`, { method: "DELETE" });
    carregarAlunos(turmaId);
  };

  // VISÃO ALUNO
  if (isAluno) {
    return (
      <div className="turmas-layout">
        <Sidebar />
        <div className="main-content">
          <h2>📘 Minhas Turmas</h2>
          {turmas.map((turma) => (
            <div key={turma.id} className="turma-card">
              <h3>{turma.nome}</h3>
              <button onClick={() => carregarAlunos(turma.id)}>👨‍🎓 Ver Dados</button>
              {alunos[turma.id] && (
                <ul>
                  {alunos[turma.id].map((aluno) =>
                    aluno.id === user.id ? (
                      <li key={aluno.id}>
                        {aluno.nome}
                      </li>
                    ) : null
                  )}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // VISÃO ADMIN
  return (
    <div className="turmas-layout">
      <Sidebar />
      <div className="main-content">
        <p className="usuario-logado">
              👤 Logado como: <strong>{user.email}</strong> ({user.tipo_usuario})
            </p>
        <header className="header">
          
          <h1> Gestão de Turmas</h1>
          
          {isAdmin && (
            <button className="btn-add" onClick={() => setShowTurmaModal(true)}>
              ➕ Nova Turma
            </button>
          )}
          
        </header>

        {turmas.map((turma) => (
          <div key={turma.id} className="turma-card">
            <h2>
              {turma.nome} - {turma.ano_letivo} - {turma.turno}
            </h2>

            {isAdmin && (
              <>
                <button onClick={() => handleDeleteTurma(turma.id)}>🗑️ Excluir Turma</button>
                <button
                  onClick={() => {
                    setTurmaSelecionada(turma.id);
                    setShowAlunoModal(true);
                  }}
                >
                  ➕ Adicionar Aluno
                </button>
              </>
            )}

            <button onClick={() => carregarAlunos(turma.id)}>👨‍🎓 Ver Alunos</button>

            {alunos[turma.id] && (
              <ul>
                {
                  alunos[turma.id].map((aluno ) => (
                  <li key={aluno.id}>
                    {aluno.nome} 
                    {isAdmin && (
                      <>
                        <button onClick={() => handleEditAluno(aluno.id, turma.id)}>✏️</button>
                        <button onClick={() => handleDeleteAluno(aluno.id, turma.id)}>🗑️</button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}

        {/* MODAL NOVA TURMA */}
        {showTurmaModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>➕ Nova Turma</h3>
              <form onSubmit={handleAddTurma}>
                <label>Nome:</label>
                <input
                  type="text"
                  value={novaTurma.nome}
                  onChange={(e) => setNovaTurma({ ...novaTurma, nome: e.target.value })}
                  required
                />
                <label>Ano Letivo:</label>
                <input
                  type="text"
                  value={novaTurma.ano_letivo}
                  onChange={(e) => setNovaTurma({ ...novaTurma, ano_letivo: e.target.value })}
                  required
                />
                <label>Turno:</label>
                <input
                  type="text"
                  value={novaTurma.turno}
                  onChange={(e) => setNovaTurma({ ...novaTurma, turno: e.target.value })}
                  required
                />
                <label>Sala:</label>
                <input
                  type="text"
                  value={novaTurma.sala}
                  onChange={(e) => setNovaTurma({ ...novaTurma, sala: e.target.value })}
                  required
                />

                <div className="modal-actions">
                  <button type="submit" className="btn-salvar">
                    Salvar
                  </button>
                  <button
                    type="button"
                    className="btn-cancelar"
                    onClick={() => setShowTurmaModal(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL ADICIONAR ALUNO */}
        {showAlunoModal && (
  <NewAlunoModal
    isOpen={showAlunoModal}
    onClose={() => setShowAlunoModal(false)}
    turmaId={turmaSelecionada}
    onSaveSuccess={(novoAluno) => {
      carregarAlunos(novoAluno.turmaId);
      
    }}
  />
)}

      </div>
    </div>
  );
}
