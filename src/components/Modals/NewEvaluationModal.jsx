import React, { useState, useEffect } from 'react';
import './NewEvaluationModal.css';
import { avaliacaoAPI, alunoAPI, turmaAPI, professorAPI } from '../../services/api';

const NewEvaluationModal = ({ isOpen, onClose, onSaveSuccess, editData }) => {
  const [formData, setFormData] = useState({
    turma_id: '',
    disciplina: '',
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

  // 🔹 Carrega dados ao abrir o modal
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

  // 🔹 Preenche o formulário quando editData mudar ou professores forem carregados
  useEffect(() => {
    if (!isOpen || professores.length === 0) return;

    if (editData) {
      setFormData({
        turma_id: editData.turma_id ? String(editData.turma_id) : '',
        disciplina: editData.disciplina || '',
        professor_id: editData.professor_id ? String(editData.professor_id) : '',
        aluno_id: editData.aluno_id ? String(editData.aluno_id) : '',
        tipo: editData.tipo || '',
        data: editData.data || '',
        peso: editData.peso || '',
        prova: editData.prova || '',
        trabalho: editData.trabalho || '',
        nota: editData.nota || ''
      });

      const prof = professores.find(p => p.id === Number(editData.professor_id));
      setDisciplinas(prof?.disciplinas || []);
    } else {
      const primeiroAluno = alunos[0];
      const primeiraTurma = turmas[0];
      const primeiroProfessor = professores[0];
      const primeiraDisciplina = primeiroProfessor?.disciplinas?.[0];

      setFormData({
        aluno_id: primeiroAluno ? String(primeiroAluno.id) : '',
        turma_id: primeiraTurma ? String(primeiraTurma.id) : '',
        professor_id: primeiroProfessor ? String(primeiroProfessor.id) : '',
        disciplina: primeiraDisciplina ? primeiraDisciplina.nome: '',
        tipo: '',
        data: '',
        peso: '',
        prova: '',
        trabalho: '',
        nota: ''
      });
      setDisciplinas(primeiroProfessor?.disciplinas || []);
    }
  }, [editData, professores, alunos, turmas, isOpen]);

  // 🔹 Atualiza disciplinas quando o professor mudar
  useEffect(() => {
    const prof = professores.find(p => p.id === Number(formData.professor_id));
    const novasDisciplinas = prof?.disciplinas || [];
    setDisciplinas(novasDisciplinas);

    if (novasDisciplinas.length > 0) {
      setFormData(prev => ({ ...prev, disciplina: novasDisciplinas[0].nome }));
    } else {
      setFormData(prev => ({ ...prev, disciplina: '' }));
    }
  }, [formData.professor_id, professores]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = ['turma_id', 'disciplina', 'professor_id', 'aluno_id', 'tipo', 'data', 'peso'];
    const missingFields = requiredFields.filter(f => !formData[f] || formData[f] === '');
    if (missingFields.length > 0) {
      alert(`Preencha os campos obrigatórios: ${missingFields.join(', ')}`);
      return;
    }

    const payload = {
      turma_id: Number(formData.turma_id),
      disciplina:formData.disciplina,
      professor_id: Number(formData.professor_id),
      aluno_id: Number(formData.aluno_id),
      tipo: formData.tipo,
      data: formData.data,
      peso: parseFloat(formData.peso),
      prova: formData.prova ? parseFloat(formData.prova) : null,
      trabalho: formData.trabalho ? parseFloat(formData.trabalho) : null,
      nota: formData.nota ? parseFloat(formData.nota) : null
    };

    try {
      console.log(payload);
      const response = await avaliacaoAPI.post('/avaliacoes', payload);
      onSaveSuccess(response.data);
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
        <h3>{editData ? "Editar Avaliação" : "Nova Avaliação"}</h3>
        <form onSubmit={handleSubmit}>
          <label>Aluno</label>
          <select
            value={formData.aluno_id}
            onChange={e => setFormData({ ...formData, aluno_id: e.target.value })}
            required
          >
            {alunos.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
          </select>

          <label>Turma</label>
          <select
            value={formData.turma_id}
            onChange={e => setFormData({ ...formData, turma_id: e.target.value })}
            required
          >
            {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>

          <label>Professor</label>
          <select
            value={formData.professor_id}
            onChange={e => setFormData({ ...formData, professor_id: e.target.value })}
            required
          >
            {professores.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>

          <label>Disciplina</label>
          <select
            value={formData.disciplina}
            onChange={e => setFormData({ ...formData, disciplina: e.target.value })}
            required
          >
            {disciplinas.length > 0 ? (
              disciplinas.map(d => <option key={d.id} value={d.nome}>{d.nome}</option>)
            ) : (
              <option value="" disabled>Selecione um professor primeiro</option>
            )}
          </select>

          <label>Tipo</label>
          <select
            value={formData.tipo}
            onChange={e => setFormData({ ...formData, tipo: e.target.value })}
            required
          >
            <option value="">Selecione...</option>
            <option value="Prova">Prova</option>
            <option value="Trabalho">Trabalho</option>
            <option value="Teste">Teste</option>
          </select>

          <label>Data</label>
          <input
            type="date"
            value={formData.data}
            onChange={e => setFormData({ ...formData, data: e.target.value })}
            required
          />

          <label>Peso</label>
          <input
            type="number"
            step="0.1"
            min="1"
            max="10"
            value={formData.peso}
            onChange={e => setFormData({ ...formData, peso: e.target.value })}
            required
          />

          <label>Nota da Prova</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="10"
            value={formData.prova}
            onChange={e => setFormData({ ...formData, prova: e.target.value })}
          />

          <label>Nota do Trabalho</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="10"
            value={formData.trabalho}
            onChange={e => setFormData({ ...formData, trabalho: e.target.value })}
          />

          <label>Nota Final</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="10"
            value={formData.nota}
            onChange={e => setFormData({ ...formData, nota: e.target.value })}
          />

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
