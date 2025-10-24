import React, { useState } from 'react';
import './EvaluationTable.css';
import EditModal from './Modals/EditModal';
import DeleteModal from './Modals/DeleteModal';
import { useAuth } from '../context/AuthContext';
import { FaEdit, FaTrash } from 'react-icons/fa';



export default function EvaluationTable({
  avaliacoes = [],
  setAvaliacoes,
  alunosMap = {},
  turmasMap = {},
  professoresMap = {}
}) {
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const { user } = useAuth();

  // 🧮 Calcula média ponderada: prova pesa 2x, trabalho 1x
  const calcMedia = (prova, trabalho) => {
    const p = Number(prova) || 0;
    const t = Number(trabalho) || 0;
    return ((p * 2 + t) / 3).toFixed(1);
  };

  // 📊 Determina situação da nota
  const getSituacao = (media) =>
    media >= 6 ? '✅ Aprovado' : media >= 4 ? '⚠️ Recuperação' : '❌ Reprovado';
  
  console.log("🔍 Usuário logado:", user);
  console.log("🧾 Avaliações recebidas:", avaliacoes);

  // 🔹 Filtra avaliações para aluno logado
  const avaliacoesFiltradas =
    user?.tipo_usuario === 'aluno'
      ? avaliacoes.filter(av => av.aluno_id === user.usuario_id)
      : avaliacoes;


  return (
    <div className="evaluation-table">
      <table>
        <thead>
          <tr>
            <th>Aluno</th>
            <th>Turma</th>
            <th>Disciplina</th>
            <th>Professor</th>
            <th>Tipo</th>
            <th>Prova</th>
            <th>Trabalho</th>
            <th>Peso</th>
            <th>Data</th>
            <th>Nota Final</th>
            <th>Média</th>
            <th>Situação</th>
            {user.role !== 'aluno' && <th>Ações</th>}
          </tr>
        </thead>
        <tbody>
          {avaliacoesFiltradas.length > 0 ? (
            avaliacoesFiltradas.map((av, index) => {
              const prova = Number(av.prova ?? av.nota ?? 0);
              const trabalho = Number(av.trabalho ?? 0);
              const media = calcMedia(prova, trabalho);

              // Nome do aluno
              const alunoNome =
                alunosMap[av.aluno_id]?.nome || av.aluno?.nome || "Desconhecido";

              // Nome da turma
              const turmaNome =
                turmasMap[av.turma_id]?.nome || av.turma?.nome || "—";

              // Nome do professor
              const professorObj = professoresMap[av.professor_id] || {};
              const professorNome = professorObj.nome || av.professor?.nome || "—";

              // Nome da disciplina: busca no array de disciplinas do professor
              const disciplinaObj = (professorObj.disciplinas || []).find(
                d => d.id === av.disciplina_id || d.tipo === av.tipo
              );
              const disciplinaNome = disciplinaObj?.nome || av.disciplina || "—";

              const rowKey = av.id ?? `${alunoNome}-${av.data}-${index}`;

              return (
                <tr key={rowKey}>
                  <td>{alunoNome}</td>
                  <td>{turmaNome}</td>
                  <td>{disciplinaNome}</td>
                  <td>{professorNome}</td>
                  <td>{av.tipo ?? "—"}</td>
                  <td>{prova}</td>
                  <td>{trabalho}</td>
                  <td>{av.peso ?? "—"}</td>
                  <td>{av.data ?? "—"}</td>
                  <td>{av.nota ?? "—"}</td>
                  <td>{media}</td>
                  <td>{getSituacao(media)}</td>
                  {user.role !== 'aluno' && (
                    <td>
                      {/* Botões de edição e exclusão */}
                      <button
                        className="btn-icon"
                        title="Editar"
                        onClick={() => setEditData(av)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn-icon"
                        title="Excluir"
                        onClick={() => setDeleteId(av.id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={user.role !== 'aluno' ? 13 : 12} style={{ textAlign: 'center' }}>
                Nenhuma avaliação registrada.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 📝 Modal de edição */}
      <EditModal
        isOpen={!!editData}
        data={editData}
        onClose={() => setEditData(null)}
        onSave={(newData) => {
          const aluno = alunosMap[newData.aluno_id] || newData.aluno || null;
          const turma = turmasMap[newData.turma_id] || newData.turma || null;

          const professorObj = professoresMap[newData.professor_id] || {};
          const disciplinaObj = (professorObj.disciplinas || []).find(
            d => d.id === newData.disciplina_id || d.tipo === newData.tipo
          );

          const professor = professorObj || null;
          const disciplina = disciplinaObj || newData.disciplina || null;

          const atualizado = { ...newData, aluno, turma, professor, disciplina };

          setAvaliacoes(prev =>
            prev.map(a => (a.id === atualizado.id ? atualizado : a))
          );
          setEditData(null);
        }}
      />

      {/* 🗑️ Modal de exclusão */}
      <DeleteModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          setAvaliacoes(prev => prev.filter(a => a.id !== deleteId));
          setDeleteId(null);
        }}
      />
    </div>
  );
}
