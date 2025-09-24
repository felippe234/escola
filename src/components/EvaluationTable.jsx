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
  turmasMap = {},       // ✅ adicionei para pegar turma
  disciplinasMap = {},
  professoresMap = {}
}) {
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const { user } = useAuth();

  // 🧮 Calcula média ponderada
  const calcMedia = (prova, trabalho) => {
    const p = Number(prova) || 0;
    const t = Number(trabalho) || 0;
    return ((p * 2 + t) / 3).toFixed(1);
  };

  // 📊 Determina situação
  const getSituacao = (media) =>
    media >= 6 ? '✅ Aprovado' : media >= 4 ? '⚠️ Recuperação' : '❌ Reprovado';

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
          {avaliacoes.length > 0 ? (
            avaliacoes.map((av, index) => {
              const prova = Number(av.prova ?? av.nota ?? 0);
              const trabalho = Number(av.trabalho ?? 0);
              const media = calcMedia(prova, trabalho);

              const alunoNome =
                alunosMap[av.aluno_id]?.nome ||
                av.aluno?.nome ||
                "Desconhecido";

              const turmaNome =
                turmasMap[av.turma_id]?.nome ||
                av.turma?.nome ||
                "—";

              const disciplinaNome =
                disciplinasMap[av.disciplina_id]?.nome ||
                av.disciplina?.nome ||
                "—";

              const professorNome =
                professoresMap[av.professor_id]?.nome ||
                av.professor?.nome ||
                "—";

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
          const disciplina = disciplinasMap[newData.disciplina_id] || newData.disciplina || null;
          const professor = professoresMap[newData.professor_id] || newData.professor || null;

          const atualizado = { ...newData, aluno, turma, disciplina, professor };

          setAvaliacoes((prev) =>
            prev.map((a) => (a.id === atualizado.id ? atualizado : a))
          );
          setEditData(null);
        }}
      />

      {/* 🗑️ Modal de exclusão */}
      <DeleteModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          setAvaliacoes((prev) => prev.filter((a) => a.id !== deleteId));
          setDeleteId(null);
        }}
      />
    </div>
  );
}
