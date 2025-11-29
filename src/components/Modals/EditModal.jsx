import React, { useState, useEffect } from 'react';
import './Modal.css';
import { alunoAPI, avaliacaoAPI } from '../../services/api';

export default function EditModal({ isOpen, onClose, data, onSave }) {
  const [formData, setFormData] = useState({
    aluno_id: '',
    prova: '',
    trabalho: '',
    peso: '',
    nota: ''
  });
  const [alunos, setAlunos] = useState([]);

  // 🔹 Carregar alunos ao abrir o modal
  useEffect(() => {
    if (!isOpen) return;

    alunoAPI.get('/alunos')
      .then(res => setAlunos(res.data))
      .catch(() => setAlunos([]));
  }, [isOpen]);

  // 🔹 Preenche os dados recebidos
  useEffect(() => {
    if (data) {
      setFormData({
        aluno_id: data.aluno_id ? String(data.aluno_id) : '',
        prova: data.prova || '',
        trabalho: data.trabalho || '',
        peso: data.peso || '',
        nota: data.nota || ''
      });
    }
  }, [data]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      aluno_id: Number(formData.aluno_id),
      prova: formData.prova ? parseFloat(formData.prova) : null,
      trabalho: formData.trabalho ? parseFloat(formData.trabalho) : null,
      peso: formData.peso ? parseFloat(formData.peso) : null,
      nota: formData.nota ? parseFloat(formData.nota) : null
    };

    try {
      // 🔹 Atualiza no backend
      console.log(payload);
      const response = await avaliacaoAPI.put(`/avaliacoes/${data.id}`, payload);

      // 🔹 Devolve os dados atualizados para o pai
      onSave(response.data);
      onClose();
    } catch (err) {
      console.error('Erro ao atualizar avaliação:', err.response?.data || err.message);
      alert('❌ Erro ao atualizar avaliação.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Editar Avaliação</h3>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="aluno">Aluno</label>
            <select
              id="aluno"
              name="aluno_id"
              value={formData.aluno_id}
              onChange={handleChange}
              required
            >
              <option value="">Selecione...</option>
              {alunos.map(a => (
                <option key={a.id} value={a.id}>{a.nome}</option>
              ))}
            </select>
          </div>
          <div>
          <label>Peso</label>
          <input
            type="number"
            step="0.1"
            min="1"
            max="10"
            name="peso"
            value={formData.peso}
            onChange={handleChange}
            required
          />
          </div>
          <div>
            <label htmlFor="prova">Prova</label>
            <input
              type="number"
              id="prova"
              name="prova"
              step="0.1"
              min="0"
              max="10"
              value={formData.prova}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="trabalho">Trabalho</label>
            <input
              type="number"
              id="trabalho"
              name="trabalho"
              step="0.1"
              min="0"
              max="10"
              value={formData.trabalho}
              onChange={handleChange}
            />
          </div>
          <div>
          <label>Nota Final</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="10"
            name="nota"
            value={formData.nota}
            onChange={handleChange}
          />
          </div>
          <div className="modal-actions">
            <button type="submit" className="btn-salvar">Salvar</button>
            <button type="button" className="btn-cancelar" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
