import React, { useState, useEffect } from 'react';
import './NewEvaluationModal.css';
import {
  avaliacaoAPI,
  alunoAPI,
  turmaAPI,
  professorAPI
} from '../../services/api';

const NewEvaluationModal = ({ isOpen, onClose, onSave, user, initialData = {} }) => {
  const [formData, setFormData] = useState({
    turma_id: '',
    disciplina_id: '',
    professor_id: '',
    aluno_id: '',
    tipo: '',
    data: '',
    peso: '',
    prova: '',
    trabalho: '',
    nota: ''
  });

  const [alunos, setAlunos] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);

  // Carrega dados iniciais ao abrir o modal
  useEffect(() => {
    if (!isOpen) return;

    Promise.all([
      alunoAPI.get('/alunos'),
      turmaAPI.get('/turmas'),
      professorAPI.get('/professores')
    ])
      .then(([alunosRes, turmasRes, professoresRes]) => {
        setAlunos(alunosRes.data);
        setTurmas(turmasRes.data);
        setProfessores(professoresRes.data);
      })
      .catch(() => {
        setAlunos([]);
        setTurmas([]);
        setProfessores([]);
      });
  }, [isOpen]);

  // Atualiza disciplinas com base no professor selecionado
  useEffect(() => {
    const prof = professores.find(p => p.id === Number(formData.professor_id));
    if (prof && prof.disciplinas?.length > 0) {
      setDisciplinas(prof.disciplinas);
      const primeiraDisciplinaId = String(prof.disciplinas[0].id);
      if (formData.disciplina_id !== primeiraDisciplinaId) {
        setFormData(prev => ({
          ...prev,
          disciplina_id: primeiraDisciplinaId
        }));
      }
    } else {
      setDisciplinas([]);
      if (formData.disciplina_id !== '') {
        setFormData(prev => ({ ...prev, disciplina_id: '' }));
      }
    }
  }, [formData.professor_id, professores]);

  // Preenche o formulário com dados iniciais ao abrir
  useEffect(() => {
    if (!isOpen) return;
    //const isEditing = initialData && Object.keys(initialData).length > 0;
    const isEditing = false;
    setFormData(isEditing
      ? initialData
      : {
          turma_id: '',
          disciplina_id: '',
          professor_id: '',
          aluno_id: '',
          tipo: '',
          data: '',
          peso: '',
          prova: '',
          trabalho: '',
          nota: ''
        }
    );
  }, [isOpen, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.disciplina_id) {
      alert("Selecione uma disciplina válida.");
      return;
    }

    const payload = {
      ...formData,
      turma_id: Number(formData.turma_id),
      disciplina_id: Number(formData.disciplina_id),
      professor_id: Number(formData.professor_id),
      aluno_id: Number(formData.aluno_id),
      peso: parseFloat(formData.peso),
      prova: formData.prova ? parseFloat(formData.prova) : 0.0,
      trabalho: formData.trabalho ? parseFloat(formData.trabalho) : 0.0,
      nota: formData.nota ? parseFloat(formData.nota) : 0.0
    };

    try {
      const response = initialData.id
        ? await avaliacaoAPI.put(`/avaliacoes/${initialData.id}`, payload)
        : await avaliacaoAPI.post('/avaliacoes', payload);

      onSave(response.data);
      onClose();
    } catch (err) {
      console.error('Erro ao salvar avaliação:', err.response?.data || err.message);
      alert('❌ Erro ao salvar avaliação. Verifique os dados e o servidor.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{initialData.id ? 'Editar Avaliação' : 'Nova Avaliação'}</h3>
        <form onSubmit={handleSubmit}>
          {/* Aluno */}
          <label>Aluno</label>
          <select value={formData.aluno_id} onChange={(e) => setFormData({ ...formData, aluno_id: e.target.value })} required>
            <option value="">Selecione um aluno</option>
            {alunos.map((a) => (
              <option key={a.id} value={a.id}>{a.nome}</option>
            ))}
          </select>

          {/* Turma */}
          <label>Turma</label>
          <select value={formData.turma_id} onChange={(e) => setFormData({ ...formData, turma_id: e.target.value })} required>
            <option value="">Selecione uma turma</option>
            {turmas.map((t) => (
              <option key={t.id} value={t.id}>{t.nome}</option>
            ))}
          </select>

          {/* Disciplina */}
          <label>Disciplina</label>
          <select value={formData.disciplina_id} onChange={(e) => setFormData({ ...formData, disciplina_id: e.target.value })} required>
            <option value="">Selecione uma disciplina</option>
            {disciplinas.map((d) => (
              <option key={d.id} value={d.id}>{d.nome}</option>
            ))}
          </select>

          {/* Professor */}
          <label>Professor</label>
          <select value={formData.professor_id} onChange={(e) => setFormData({ ...formData, professor_id: e.target.value })} required>
            <option value="">Selecione um professor</option>
            {professores.map((p) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>

          {/* Tipo */}
          <label>Tipo</label>
          <select value={formData.tipo} onChange={(e) => setFormData({ ...formData, tipo: e.target.value })} required>
            <option value="">Selecione...</option>
            <option value="Prova">Prova</option>
            <option value="Trabalho">Trabalho</option>
            <option value="Teste">Teste</option>
          </select>

          {/* Data */}
          <label>Data</label>
          <input type="date" value={formData.data} onChange={(e) => setFormData({ ...formData, data: e.target.value })} required />

          {/* Peso */}
          <label>Peso</label>
          <input type="number" step="0.1" min="1" max="10" value={formData.peso} onChange={(e) => setFormData({ ...formData, peso: e.target.value })} required />

          {/* Notas */}
          <label>Nota da Prova</label>
          <input type="number" step="0.1" min="0" max="10" value={formData.prova} onChange={(e) => setFormData({ ...formData, prova: e.target.value })} />

          <label>Nota do Trabalho</label>
          <input type="number" step="0.1" min="0" max="10" value={formData.trabalho} onChange={(e) => setFormData({ ...formData, trabalho: e.target.value })} />

          <label>Nota Final</label>
          <input type="number" step="0.1" min="0" max="10" value={formData.nota} onChange={(e) => setFormData({ ...formData, nota: e.target.value })} />

          <div className="modal-actions">
            <button type="submit" className="evaluation-button">Salvar</button>
            <button type="button" onClick={onClose} className="evaluation-button cancel">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewEvaluationModal;
