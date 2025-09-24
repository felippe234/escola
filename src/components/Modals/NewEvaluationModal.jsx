import React, { useState, useEffect } from 'react';
import './NewEvaluationModal.css';
import { avaliacaoAPI, alunoAPI, turmaAPI, professorAPI } from '../../services/api';

const NewEvaluationModal = ({ isOpen, onClose, onSaveSuccess, editData }) => {
  // Estado principal do formulário
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

  // Estados auxiliares para popular selects
  const [alunos, setAlunos] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);

  // 🔹 Carrega alunos, turmas e professores ao abrir modal
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

        // Se NÃO estivermos editando, inicializa valores automaticamente
        if (!editData) {
          const primeiroAluno = alunosRes.data[0];
          const primeiraTurma = turmasRes.data[0];
          const primeiroProfessor = professoresRes.data[0];
          const primeiraDisciplina = primeiroProfessor?.disciplinas?.[0];

          setFormData({
            aluno_id: primeiroAluno ? String(primeiroAluno.id) : '',
            turma_id: primeiraTurma ? String(primeiraTurma.id) : '',
            professor_id: primeiroProfessor ? String(primeiroProfessor.id) : '',
            disciplina_id: primeiraDisciplina ? String(primeiraDisciplina.id) : '',
            tipo: '',
            data: '',
            peso: '',
            prova: '',
            trabalho: '',
            nota: ''
          });

          setDisciplinas(primeiroProfessor?.disciplinas || []);
        }
      })
      .catch(() => {
        // fallback em caso de erro na API
        setAlunos([]);
        setTurmas([]);
        setProfessores([]);
        setDisciplinas([]);
      });

    // Se estivermos editando, preenche os dados existentes
    if (editData) {
      setFormData({
        turma_id: editData.turma_id ? String(editData.turma_id) : '',
        disciplina_id: editData.disciplina_id ? String(editData.disciplina_id) : '',
        professor_id: editData.professor_id ? String(editData.professor_id) : '',
        aluno_id: editData.aluno_id ? String(editData.aluno_id) : '',
        tipo: editData.tipo || '',
        data: editData.data || '',
        peso: editData.peso || '',
        prova: editData.prova || '',
        trabalho: editData.trabalho || '',
        nota: editData.nota || ''
      });

      const prof = editData.professor_id
        ? professores.find(p => p.id === Number(editData.professor_id))
        : null;
      setDisciplinas(prof?.disciplinas || []);
    }

  }, [isOpen, editData]);

  // 🔹 Atualiza disciplinas sempre que o professor mudar
  useEffect(() => {
    const prof = professores.find(p => p.id === Number(formData.professor_id));
    const novasDisciplinas = prof?.disciplinas || [];
    setDisciplinas(novasDisciplinas);

    // Seleciona a primeira disciplina automaticamente se existir
    if (novasDisciplinas.length > 0) {
      const primeira = String(novasDisciplinas[0].id);
      if (formData.disciplina_id !== primeira) {
        setFormData(prev => ({ ...prev, disciplina_id: primeira }));
      }
    } else {
      if (formData.disciplina_id !== '') {
        setFormData(prev => ({ ...prev, disciplina_id: '' }));
      }
    }
  }, [formData.professor_id, formData.disciplina_id, professores]);

  // 🔹 Função para enviar o formulário
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verifica campos obrigatórios
    const requiredFields = ['turma_id', 'disciplina_id', 'professor_id', 'aluno_id', 'tipo', 'data', 'peso'];
    const missingFields = requiredFields.filter(f => !formData[f] || formData[f] === '');

    if (missingFields.length > 0) {
      alert(`Preencha os campos obrigatórios: ${missingFields.join(', ')}`);
      return;
    }

    // Cria payload com disciplina_id seguro (nunca NaN)
    const payload = {
      turma_id: Number(formData.turma_id),
      disciplina_id: formData.disciplina_id
        ? Number(formData.disciplina_id)
        : Number(disciplinas[0]?.id || 0), // fallback para primeira disciplina
      professor_id: Number(formData.professor_id),
      aluno_id: Number(formData.aluno_id),
      tipo: formData.tipo,
      data: formData.data,
      peso: parseFloat(formData.peso),
      prova: formData.prova ? parseFloat(formData.prova) : null,
      trabalho: formData.trabalho ? parseFloat(formData.trabalho) : null,
      nota: formData.nota ? parseFloat(formData.nota) : null
    };

    console.log("Payload enviado:", payload);

    try {
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
            value={formData.disciplina_id}
            onChange={e => setFormData({ ...formData, disciplina_id: e.target.value })}
            required
          >
            {disciplinas.length > 0 ? (
              disciplinas.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)
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
