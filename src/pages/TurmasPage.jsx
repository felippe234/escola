import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import "./TurmasPage.css";

export default function TurmasPage() {
  const { user } = useAuth();
  const [turmas, setTurmas] = useState([]);
  const [alunos, setAlunos] = useState({});

  useEffect(() => {
    fetch("http://localhost:4004/turmas")
      .then((res) => res.json())
      .then((data) => setTurmas(data));
  }, []);

  const isAdmin = user?.tipo_usuario === "admin";
  const isAluno = user?.tipo_usuario=== "aluno";

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
                        {aluno.nome} - 📊 Média: {aluno.media} - 📅 Presença: {aluno.presenca}%
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

  // Funções CRUD
  const handleAddTurma = async () => {
    const nome = prompt("Nome da turma:");
    const ano_letivo = prompt("Ano letivo:");
    const turno = prompt("Turno:");
    const sala = prompt("Sala:");
    if (!nome) return;

    const res = await fetch("http://localhost:4004/turmas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, ano_letivo, turno, sala, status: "Ativa" }),
    });
    const data = await res.json();
    setTurmas([...turmas, data]);
  };

  const handleDeleteTurma = async (id) => {
    await fetch(`http://localhost:4004/turmas/${id}`, { method: "DELETE" });
    setTurmas(turmas.filter((t) => t.id !== id));
  };

  const carregarAlunos = async (turmaId) => {
    const res = await fetch(`http://localhost:4004/turmas/${turmaId}/alunos`);
    const data = await res.json();
    setAlunos({ ...alunos, [turmaId]: data });
  };

  const handleAddAluno = async (turmaId) => {
    const nome = prompt("Nome do aluno:");
    const media = prompt("Média:");
    const presenca = prompt("Presença:");
    if (!nome) return;

    const res = await fetch(`http://localhost:4004/turmas/${turmaId}/alunos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, media, presenca }),
    });
    const data = await res.json();
    setAlunos((prev) => ({
      ...prev,
      [turmaId]: [...(prev[turmaId] || []), data],
    }));
  };

  const handleEditAluno = async (alunoId, turmaId) => {
    const nome = prompt("Novo nome:");
    const media = prompt("Nova média:");
    const presenca = prompt("Nova presença:");
    if (!nome) return;

    const res = await fetch(`http://localhost:4004/alunos/${alunoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, media, presenca }),
    });
    const data = await res.json();

    setAlunos((prev) => ({
      ...prev,
      [turmaId]: prev[turmaId].map((a) => (a.id === alunoId ? data : a)),
    }));
  };

  const handleDeleteAluno = async (alunoId, turmaId) => {
    await fetch(`http://localhost:4004/alunos/${alunoId}`, { method: "DELETE" });
    setAlunos((prev) => ({
      ...prev,
      [turmaId]: prev[turmaId].filter((a) => a.id !== alunoId),
    }));
  };

  return (
    <div className="turmas-layout">
      <Sidebar />
      <div className="main-content">
        <header className="header">
          <h1>📘 Gestão de Turmas</h1>
          {isAdmin && (
            <button className="btn-add" onClick={handleAddTurma}>
              ➕ Nova Turma
            </button>
          )}
        </header>

        {turmas.map((turma) => (
          <div key={turma.id} className="turma-card">
            <h2>{turma.nome} - {turma.ano_letivo} - {turma.turno}</h2>

            {isAdmin && (
              <>
                <button onClick={() => handleDeleteTurma(turma.id)}>🗑️ Excluir Turma</button>
                <button onClick={() => handleAddAluno(turma.id)}>➕ Adicionar Aluno</button>
              </>
            )}

            <button onClick={() => carregarAlunos(turma.id)}>👨‍🎓 Ver Alunos</button>

            {alunos[turma.id] && (
              <ul>
                {alunos[turma.id].map((aluno) => (
                  <li key={aluno.id}>
                    {aluno.nome} - 📊 {aluno.media} - 📅 {aluno.presenca}%
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
      </div>
    </div>
  );
}
