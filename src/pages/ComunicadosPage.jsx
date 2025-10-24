// src/pages/ComunicadosPage.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { comunicadoAPI, alunoAPI, turmaAPI } from "../services/api";
import "./ComunicadosPage.css";

export default function ComunicadosPage() {
  const { user } = useAuth();

  // Estados principais
  const [comunicados, setComunicados] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [erro, setErro] = useState(null);

  // Modal e formulário
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({
    remetente_id:"",
    titulo: "",
    mensagem: "",
    tipo: "",
    publico_alvo: "",
    turma_id: "",
    aluno_id: "",
  });

  // ------------------------------
  // CARREGAR DADOS INICIAIS DA API
  // ------------------------------
  useEffect(() => {
    async function carregarDados() {
      try {
        const [resComunicados, resAlunos, resTurmas] = await Promise.all([
          comunicadoAPI.get("/comunicados"),
          alunoAPI.get("/alunos"),
          turmaAPI.get("/turmas"),
        ]);

        setComunicados(resComunicados.data);
        setAlunos(resAlunos.data);
        setTurmas(resTurmas.data);
        setErro(null);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        setErro("Não foi possível carregar os dados. Verifique a conexão com a API e as permissões de CORS.");
      }
    }
    carregarDados();
  }, []);

  // ------------------------------
  // FUNÇÕES DO MODAL E FORMULÁRIO
  // ------------------------------
  const openNewModal = () => {
    setEditData(null);
    setFormData({
      remetente_id:"",
      titulo: "",
      mensagem: "",
      tipo: "",
      publico_alvo: "",
      turma_id: "",
      aluno_id: "",
    });
    setShowModal(true);
  };

  const openEditModal = (comunicado) => {
    setEditData(comunicado);
    setFormData({
      remetente_id:comunicado.remetente_id,
      titulo: comunicado.titulo,
      mensagem: comunicado.mensagem,
      tipo: comunicado.tipo,
      publico_alvo: comunicado.publico_alvo,
      turma_id: comunicado.turma_id || "",
      aluno_id: comunicado.aluno_id || "",
    });
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditData(null);
    setFormData({
      remetente_id:"",
      titulo: "",
      mensagem: "",
      tipo: "",
      publico_alvo: "",
      turma_id: "",
      aluno_id: "",
    });
  };

  // ------------------------------
  // SALVAR COMUNICADO (POST ou PUT)
  // ------------------------------
  const handleSave = async (data) => {
    try {
      // ✅ Prepara os dados, incluindo campos gerados automaticamente
      const dataToSend = {
        remetente_id:data.remetente_id,
        titulo: data.titulo,
        mensagem: data.mensagem,
        tipo: data.tipo,
        publico_alvo: data.publico_alvo,
        
        data_envio: new Date().toISOString().split("T")[0],
        // Condiciona o envio de turma_id e aluno_id com null
        turma_id: data.publico_alvo === "turma" ? parseInt(data.turma_id) : null,
        aluno_id: data.publico_alvo === "aluno" ? parseInt(data.aluno_id) : null,
      };

      // ✅ Validação do lado do cliente
      if (!dataToSend.titulo || !dataToSend.mensagem || !dataToSend.tipo || !dataToSend.publico_alvo || !dataToSend.remetente_id) {
        alert("Preencha todos os campos obrigatórios (título, mensagem, tipo, público-alvo) e certifique-se de estar logado.");
        return;
      }

      // ✅ PUT para edição
      if (editData) {
        const res = await comunicadoAPI.put(`/comunicados/${editData.id}`, dataToSend);
        setComunicados((prev) =>
          prev.map((c) => (c.id === editData.id ? { ...c, ...res.data } : c))
        );
      } 
      // ✅ POST para novo comunicado
      else {
        const res = await comunicadoAPI.post("/comunicados", dataToSend);
        setComunicados((prev) => [...prev, res.data]);
      }

      handleModalClose(); // Fecha o modal e reseta o formulário
    } catch (err) {
      console.error("Erro ao salvar comunicado:", err);
      alert(
        err.response?.data?.message || err.message ||
        "Erro ao salvar comunicado. Verifique se o servidor está rodando e se os dados estão corretos."
      );
    }
  };

  // ------------------------------
  // EXCLUIR COMUNICADO
  // ------------------------------
  const handleDelete = async (id) => {
    if (window.confirm("Deseja excluir este comunicado?")) {
      try {
        await comunicadoAPI.delete(`/comunicados/${id}`);
        setComunicados((prev) => prev.filter((c) => c.id !== id));
      } catch (err) {
        console.error("Erro ao excluir comunicado:", err);
        alert("Erro ao excluir comunicado.");
      }
    }
  };

  if (!user) {
    return (
      <div className="comunicados-layout">
        <Sidebar />
        <div className="main-content">
          <p className="erro">⚠️ Nenhum usuário logado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="comunicados-layout">
      <Sidebar />
      <div className="main-content">
        <header className="header">
          <h1>📢 Comunicados</h1>
          {user?.tipo_usuario !== "aluno" && (
            <button className="btn-add" onClick={openNewModal}>
              ➕ Novo Comunicado
            </button>
          )}
        </header>

        {erro && <p className="erro">{erro}</p>}

        {/* Tabela de comunicados */}
        <div className="comunicados-table">
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Mensagem</th>
                <th>Tipo</th>
                <th>Público-Alvo</th>
                <th>Turma</th>
                <th>Aluno</th>
                <th>Remetente</th>
                <th>Data</th>
                {user?.tipo_usuario !== "aluno" && <th>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {comunicados.length > 0 ? (
                comunicados.map((c) => {
                  const aluno = alunos.find((a) => a.id === c.aluno_id);
                  const turma = turmas.find((t) => t.id === c.turma_id);
                  return (
                    <tr key={c.id}>
                      <td>{c.titulo}</td>
                      <td>{c.mensagem}</td>
                      <td>{c.tipo}</td>
                      <td>{c.publico_alvo}</td>
                      <td>{turma?.nome || "-"}</td>
                      <td>{aluno?.nome || "-"}</td>
                      <td>{c.remetente_id}</td>
                      <td>{c.data_envio}</td>
                      {user?.tipo_usuario!== "aluno" && (
                        <td className="acoes-cell">
                          <button
                            className="btn-acao editar"
                            onClick={() => openEditModal(c)}
                          >
                            🖊️
                          </button>
                          <button
                            className="btn-acao excluir"
                            onClick={() => handleDelete(c.id)}
                          >
                            🗑️
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="no-data">Nenhum comunicado encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal de criação/edição */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>{editData ? "✏️ Editar Comunicado" : "➕ Novo Comunicado"}</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave(formData);
                }}
              >
                
                <label>Remetente ID</label>
                <input
                  type="text"
                  value={formData.remetente_id || ""}
                   onChange={(e) =>
                    setFormData({ ...formData, remetente_id: e.target.value })
                  }
                  required
                  
                />
                
                <label>Título</label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) =>
                    setFormData({ ...formData, titulo: e.target.value })
                  }
                  required
                />

                <label>Mensagem</label>
                <textarea
                  value={formData.mensagem}
                  onChange={(e) =>
                    setFormData({ ...formData, mensagem: e.target.value })
                  }
                  required
                />

                <label>Tipo</label>
                <select
                  value={formData.tipo}
                  onChange={(e) =>
                    setFormData({ ...formData, tipo: e.target.value })
                  }
                  required
                >
                  <option value="">Selecione</option>
                  <option value="Aviso">Aviso</option>
                  <option value="Evento">Evento</option>
                  <option value="Urgente">Urgente</option>
                </select>

                <label>Público-Alvo</label>
                <select
                  value={formData.publico_alvo}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      publico_alvo: e.target.value,
                      turma_id: "",
                      aluno_id: "",
                    })
                  }
                  required
                >
                  <option value="">Selecione</option>
                  <option value="geral">Geral</option>
                  <option value="turma">Turma</option>
                  <option value="aluno">Aluno</option>
                </select>

                {formData.publico_alvo === "turma" && (
                  <>
                    <label>Turma</label>
                    <select
                      value={formData.turma_id}
                      onChange={(e) =>
                        setFormData({ ...formData, turma_id: e.target.value })
                      }
                      required
                    >
                      <option value="">Selecione</option>
                      {turmas.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.nome}
                        </option>
                      ))}
                    </select>
                  </>
                )}

                {formData.publico_alvo === "aluno" && (
                  <>
                    <label>Aluno</label>
                    <select
                      value={formData.aluno_id}
                      onChange={(e) =>
                        setFormData({ ...formData, aluno_id: e.target.value })
                      }
                      required
                    >
                      <option value="">Selecione</option>
                      {alunos.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.nome}
                        </option>
                      ))}
                    </select>
                  </>
                )}

                <div className="modal-actions">
                  <button type="submit" className="btn-salvar">
                    Salvar
                  </button>
                  <button
                    type="button"
                    className="btn-cancelar"
                    onClick={handleModalClose}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}