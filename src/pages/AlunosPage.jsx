// src/pages/AlunosPage.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { alunoAPI } from "../services/api";
import "./AlunosPage.css";

export default function AlunosPage() {
  const { user } = useAuth();

  const [alunos, setAlunos] = useState([]);
  const [aluno, setAluno] = useState([]);
  const [erro, setErro] = useState(null);

  const [editData, setEditData] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Carregar alunos
  useEffect(() => {
    async function carregarAlunos() {
      try {
        const response = await alunoAPI.get("/alunos");
        
        setAlunos(response.data);
      } catch (err) {
        console.error("Erro ao buscar alunos:", err);
        setErro("Não foi possível carregar os alunos.");
      }
    }
    async function carregarAluno(user) {
      try {
        
        if(user.usuario_id){
          const response = await alunoAPI.get(`/alunos/${user.usuario_id}`);
          const aluno = {
           ...user,
           ...response.data
          };
          setAluno(aluno);
        }
        
      } catch (err) {
        console.error("Erro ao buscar alunos:", err);
        setErro("Não foi possível carregar os alunos.");
      }
    }
    if (user?.tipo_usuario === "aluno"){
      
      carregarAluno(user);

    } else{
      carregarAlunos();
    }
    
  }, [user]);

  // Salvar aluno (POST ou PUT)
  const handleSave = async (data) => {
    try {
      if (editData) {
        // PUT para edição
        await alunoAPI.put(`/alunos/${data.id}`, {
          matricula: data.matricula,
          nome: data.nome,
          data_nascimento: data.data_nascimento,
          email: data.email,
          telefone: data.telefone,
          endereco: data.endereco,
          status: data.status || "ativo",
        });
        setAlunos((prev) =>
          prev.map((a) => (a.id === data.id ? { ...a, ...data } : a))
        );
      } else {
        // POST (novo aluno)
        const dataToSend = {
          
          nome: data.nome,
          data_nascimento: data.data_nascimento,
          email: data.email,
          telefone: data.telefone,
          endereco: data.endereco,
          status: data.status || "ativo",
        };
        const response = await alunoAPI.post("/alunos", dataToSend);
        setAlunos((prev) => [...prev, response.data]);
      }

      setShowModal(false);
      setEditData(null);
    } catch (err) {
      console.error("Erro ao salvar aluno:", err);
      alert(
        "Erro ao salvar aluno. Verifique se o backend está rodando e os dados estão corretos."
      );
    }
  };

  // Deletar aluno
  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este aluno?")) {
      try {
        await alunoAPI.delete(`/alunos/${id}`);
        setAlunos((prev) => prev.filter((a) => a.id !== id));
      } catch (err) {
        console.error("Erro ao excluir aluno:", err);
        alert("Erro ao excluir aluno.");
      }
    }
  };

  return (
    <div className="alunos-layout">
      <Sidebar />
      <div className="main-content">
        <header className="header">
          <h1> Gestão de Alunos</h1>
          {user && (
            <p className="usuario-logado">
              👤 Logado como: <strong>{user.email}</strong> ({user.tipo_usuario})
            </p>
          )}
        </header>

        {!user && (
          <p className="erro">
            ⚠️ Nenhum usuário logado. Faça login para acessar esta página.
          </p>
        )}

        {/* PERFIL DO ALUNO */}
        {user?.tipo_usuario === "aluno" && (
          <div className="aluno-perfil">
            <h2>📌 Meu Perfil</h2>
            <p>
              <strong>ID:</strong> {aluno.id}
            </p>
            <p>
              <strong>Matrícula:</strong> {aluno.matricula}
            </p>
            <p>
              <strong>Nome:</strong> {aluno.nome}
            </p>
            <p>
              <strong>Data de Nascimento:</strong> {aluno.data_nascimento}
            </p>
            <p>
              <strong>Email:</strong> {aluno.email}
            </p>
            <p>
              <strong>Telefone:</strong> {aluno.telefone}
            </p>
            <p>
              <strong>Endereço:</strong> {aluno.endereco}
            </p>
            <p>
              <strong>Status:</strong> {aluno.status || "ativo"}
            </p>
          </div>
        )}

        {/* VISÃO DO PROFESSOR */}
        {user?.tipo_usuario === "professor" && (
          <div className="professor-alunos">
            <h2> Lista de Alunos</h2>
            {erro && <p className="erro">{erro}</p>}
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Matrícula</th>
                  <th>Nome</th>
                  <th>Data de Nascimento</th>
                  <th>Email</th>
                  <th>Telefone</th>
                  <th>Endereço</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {alunos.map((a) => (
                  <tr key={a.id}>
                    <td>{a.id}</td>
                    <td>{a.matricula}</td>
                    <td>{a.nome}</td>
                    <td>{a.data_nascimento}</td>
                    <td>{a.email}</td>
                    <td>{a.telefone}</td>
                    <td>{a.endereco}</td>
                    <td>{a.status || "ativo"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* VISÃO DO ADMIN */}
        {user?.tipo_usuario === "admin" && (
          <div className="admin-alunos">
            <div className="alunos-header">
              <h2> Lista de Alunos</h2>
              <button className="btn-add" onClick={() => setShowModal(true)}>
                ➕ Adicionar Aluno
              </button>
            </div>
            {erro && <p className="erro">{erro}</p>}
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Matrícula</th>
                  <th>Nome</th>
                  <th>Data de Nascimento</th>
                  <th>Email</th>
                  <th>Telefone</th>
                  <th>Endereço</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {alunos.map((a) => (
                  <tr key={a.id}>
                    <td>{a.id}</td>
                    <td>{a.matricula}</td>
                    <td>{a.nome}</td>
                    <td>{a.data_nascimento}</td>
                    <td>{a.email}</td>
                    <td>{a.telefone}</td>
                    <td>{a.endereco}</td>
                    <td>{a.status || "ativo"}</td>
                    <td>
                      <button
                        onClick={() => {
                          setEditData(a);
                          setShowModal(true);
                        }}
                      >
                        ✏️
                      </button>
                      <button onClick={() => handleDelete(a.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Modal de cadastro/edição */}
            {showModal && (
              <div className="modal-overlay">
                <div className="modal">
                  <h3>{editData ? "Editar Aluno" : "Adicionar Aluno"}</h3>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSave({
                        id: editData ? editData.id : null,
                        // matricula: e.target.matricula.value,
                        nome: e.target.nome.value,
                        data_nascimento: e.target.data_nascimento.value,
                        email: e.target.email.value,
                        telefone: e.target.telefone.value,
                        endereco: e.target.endereco.value,
                        status: e.target.status.value || "ativo",
                      });
                    }}
                  >
                    {/* <label>Matrícula</label>
                    <input
                      type="text"
                      name="matricula"
                      defaultValue={editData?.matricula || ""}
                      required
                    /> */}

                    <label>Nome</label>
                    <input
                      type="text"
                      name="nome"
                      defaultValue={editData?.nome || ""}
                      required
                    />

                    <label>Data de Nascimento</label>
                    <input
                      type="date"
                      name="data_nascimento"
                      defaultValue={editData?.data_nascimento || ""}
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
                      required
                    />

                    <label>Endereço</label>
                    <input
                      type="text"
                      name="endereco"
                      defaultValue={editData?.endereco || ""}
                      required
                    />

                    <label>Status</label>
                    <select
                      name="status"
                      defaultValue={editData?.status || "ativo"}
                    >
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                    </select>

                    <div className="modal-actions">
                      <button type="submit" className="btn-salvar">
                        Salvar
                      </button>
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

        {user &&
          !["aluno", "professor", "admin"].includes(user.tipo_usuario) && (
            <p className="erro">
              ⚠️ Seu perfil não possui permissões para acessar esta página.
            </p>
          )}
      </div>
    </div>
  );
}
