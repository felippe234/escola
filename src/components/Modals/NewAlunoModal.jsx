import React, { useState, useEffect } from "react";
import "./NewAlunoModal.css";
import { alunoAPI, turmaAPI } from "../../services/api";

const NewAlunoModal = ({ isOpen, onClose, turmaId, onSaveSuccess }) => {
  const [formData, setFormData] = useState({
    alunoId: "",
   
  });

  const [alunos, setAlunos] = useState([]);
  const [turma, setTurma] = useState(null);

  // 🔹 Carrega alunos e a turma atual
  useEffect(() => {
    if (!isOpen) return;

    Promise.all([
      alunoAPI.get("/alunos"),
      turmaAPI.get(`/turmas/${turmaId}`)
    ])
      .then(([alunosRes, turmaRes]) => {
        setAlunos(alunosRes.data);
        setTurma(turmaRes.data);
      })
      .catch((err) => {
        console.error("Erro ao carregar dados:", err);
        setAlunos([]);
        setTurma(null);
      });
  }, [isOpen, turmaId]);

  // 🔹 Submissão do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.alunoId ) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    const payload = {
      alunoId: Number(formData.alunoId)
      
    };

    try {
      const res = await turmaAPI.post(`/turmas/${turmaId}/alunos`, payload);
      onSaveSuccess(res.data);
      onClose();
    } catch (err) {
      console.error("Erro ao adicionar aluno:", err.response?.data || err.message);
      alert("❌ Erro ao adicionar aluno. Verifique os dados e o servidor.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>👨‍🎓 Adicionar Aluno à Turma {turma?.nome || ""}</h3>
        <form onSubmit={handleSubmit}>
          <label>Selecione o Aluno</label>
          <select
            value={formData.alunoId}
            onChange={(e) => setFormData({ ...formData, alunoId: e.target.value })}
            required
          >
            <option value="">Selecione...</option>
            {alunos.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome} ({a.email})
              </option>
            ))}
          </select>

          

          <div className="modal-actions">
            <button type="submit" className="evaluation-button">Salvar</button>
            <button type="button" onClick={onClose} className="evaluation-button cancel">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewAlunoModal;
