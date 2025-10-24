// src/pages/ProfessoresPage.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { professorAPI } from "../services/api";
import "./ProfessoresPage.css";

export default function ProfessoresPage() {
  const { user } = useAuth();

  const [professores, setProfessores] = useState([]);
  const [erro, setErro] = useState(null);
  const [editData, setEditData] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // 🔄 Carregar professores
  useEffect(() => {
    async function carregarProfessores() {
      try {
        const response = await professorAPI.get("/professores");
        setProfessores(response.data);
      } catch (err) {
        console.error("Erro ao buscar professores:", err);
        setErro("Não foi possível carregar os professores.");
      }
    }
    carregarProfessores();
  }, []);

  // 💾 Salvar professor (criar ou atualizar)
  const handleSave = async (data) => {
    try {
      const payload = {
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        titulacao: data.titulacao,
        disciplina: data.disciplina, // Envia como string
      };

      if (editData) {
        // Atualizar professor
        await professorAPI.put(`/professores/${editData.id}`, payload);

        setProfessores((prev) =>
          prev.map((p) =>
            p.id === editData.id ? { ...p, ...payload, id: editData.id } : p
          )
        );
      } else {
        // Criar professor
        const response = await professorAPI.post("/professores", payload);
        setProfessores((prev) => [...prev, response.data]);
      }

      setShowModal(false);
      setEditData(null);
    } catch (err) {
      console.error("Erro ao salvar professor:", err);
      alert(
        "Erro ao salvar professor. Verifique se o backend está rodando e os dados estão corretos."
      );
    }
  };

  // 🗑️ Deletar professor
  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este professor?")) {
      try {
        await professorAPI.delete(`/professores/${id}`);
        setProfessores((prev) => prev.filter((p) => p.id !== id));
      } catch (err) {
        console.error("Erro ao excluir professor:", err);
        alert("Erro ao excluir professor.");
      }
    }
  };

  return (
    <div className="professores-layout">
      <Sidebar />
      <div className="main-content">
        <header className="header">
          <h1>👨‍🏫 Gestão de Professores</h1>
          {user && (
            <p className="usuario-logado">
              👤 Logado como: <strong>{user.nome}</strong> ({user.tipo_usuario})
            </p>
          )}
        </header>

        {!user && (
          <p className="erro">
            ⚠️ Nenhum usuário logado. Faça login para acessar esta página.
          </p>
        )}

        {/* PERFIL DO PROFESSOR */}
        {user?.tipo_usuario === "professor" && (
          <div className="professor-perfil">
            <h2>📌 Meu Perfil</h2>
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Nome:</strong> {user.nome}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Telefone:</strong> {user.telefone}</p>
            <p><strong>Titulação:</strong> {user.titulacao}</p>
            <p><strong>Disciplina:</strong> {user.disciplina}</p>
          </div>
        )}

        {/* VISÃO DO ADMIN */}
        {user?.tipo_usuario === "admin" && (
          <div className="admin-professores">
            <div className="professores-header">
              <h2>📋 Lista de Professores</h2>
              <button className="btn-add" onClick={() => setShowModal(true)}>
                ➕ Adicionar Professor
              </button>
            </div>

            {erro && <p className="erro">{erro}</p>}

            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Telefone</th>
                  <th>Titulação</th>
                  <th>Disciplina</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {professores.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.nome}</td>
                    <td>{p.email}</td>
                    <td>{p.telefone}</td>
                    <td>{p.titulacao}</td>
                    <td>
                      {p.disciplina || p.disciplinas?.map(d => d.nome).join(", ")}
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          setEditData(p);
                          setShowModal(true);
                        }}
                      >
                        ✏️
                      </button>
                      <button onClick={() => handleDelete(p.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Modal */}
            {showModal && (
              <div className="modal-overlay">
                <div className="modal">
                  <h3>{editData ? "Editar Professor" : "Adicionar Professor"}</h3>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSave({
                        nome: e.target.nome.value,
                        email: e.target.email.value,
                        telefone: e.target.telefone.value,
                        titulacao: e.target.titulacao.value,
                        disciplina: e.target.disciplina.value,
                      });
                    }}
                  >
                    <label>Nome</label>
                    <input
                      type="text"
                      name="nome"
                      defaultValue={editData?.nome || ""}
                      required
                    />

                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      defaultValue={editData?.email || ""}
                      required
                    />

                    <label>Telefone</label>
                    <input
                      type="text"
                      name="telefone"
                      defaultValue={editData?.telefone || ""}
                    />

                    <label>Titulação</label>
                    <select
                      name="titulacao"
                      defaultValue={editData?.titulacao || ""}
                    >
                      <option value="">Selecione</option>
                      <option value="Graduação">Graduação</option>
                      <option value="Mestrado">Mestrado</option>
                      <option value="Doutorado">Doutorado</option>
                    </select>

                    <label>Disciplina</label>
                    <input
                      type="text"
                      name="disciplina"
                      defaultValue={
                        editData?.disciplina || editData?.disciplinas?.map(d => d.nome).join(", ") || ""
                      }
                      required
                    />

                    <div className="modal-actions">
                      <button type="submit" className="btn-salvar">Salvar</button>
                      <button
                        type="button"
                        className="btn-cancelar"
                        onClick={() => {
                          setShowModal(false);
                          setEditData(null);
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {user && !["professor", "admin"].includes(user.tipo_usuario) && (
          <p className="erro">
            ⚠️ Seu perfil não possui permissões para acessar esta página.
          </p>
        )}
      </div>
    </div>
  );
}
