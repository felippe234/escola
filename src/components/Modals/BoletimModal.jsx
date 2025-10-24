// src/components/Modals/BoletimModal.jsx
import React, { useEffect, useState } from "react";
import "./BoletimModal.css";
import { alunoAPI } from "../../services/api";
import BoletimPDFDownloader from "../BoletimPDFDownloader";

const calcMedia = (prova, trabalho) => {
  const p = Number(prova) || 0;
  const t = Number(trabalho) || 0;
  return ((p * 2 + t) / 3).toFixed(1);
};


const getSituacao2 = (media) =>
  media >= 6 ? "Aprovado" : media >= 4 ? "Recuperação" : "Reprovado";
const BoletimModal = ({
  isOpen,
  onClose,
  aluno,
  avaliacoes = [],
  setAvaliacoes,
  turmasMap = {},
  professoresMap = {},
}) => {
  const [dadosAluno, setDadosAluno] = useState(null);

  useEffect(() => {
    if (isOpen && aluno?.usuario_id) {
      const carregarAluno = async () => {
        try {
          const res = await alunoAPI.get(`/alunos/${aluno.usuario_id}`);
          setDadosAluno(res.data);
        } catch (err) {
          console.error("Erro ao carregar dados do aluno:", err);
          setDadosAluno(null);
        }
      };
      carregarAluno();
    }
  }, [isOpen, aluno]);

  if (!isOpen) return null;

  const avaliacoesFiltradas = avaliacoes
    .filter((av) => av.aluno_id === aluno?.usuario_id)
    .map((av) => {
      const prova = Number(av.prova ?? av.nota ?? 0);
      const trabalho = Number(av.trabalho ?? 0);
      const media = calcMedia(prova, trabalho);
      const situacao = getSituacao2(media);

      return {
        ...av,
        prova,
        trabalho,
        media,
        situacao,
        turmaNome: turmasMap[av.turma_id]?.nome || av.turma?.nome,
        professorNome:
          professoresMap[av.professor_id]?.nome || av.professor?.nome,
        disciplinaNome:
          (professoresMap[av.professor_id]?.disciplinas || []).find(
            (d) => d.id === av.disciplina_id || d.tipo === av.tipo
          )?.nome || av.disciplina,
      };
    });

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <h3>📘 Boletim do Aluno</h3>

        {dadosAluno ? (
          <div className="aluno-info">
            <p><strong>Nome:</strong> {dadosAluno.nome}</p>
            <p><strong>Matrícula:</strong> {dadosAluno.matricula}</p>
            <p><strong>Email:</strong> {dadosAluno.email}</p>
            <p><strong>Telefone:</strong> {dadosAluno.telefone || "—"}</p>
          </div>
        ) : (
          <p>Carregando informações do aluno...</p>
        )}

        <h4 style={{ marginTop: "10px" }}>📚 Notas e Situação</h4>
        <table className="boletim-table">
          <thead>
            <tr>
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
            </tr>
          </thead>
          <tbody>
            {avaliacoesFiltradas.length > 0 ? (
              avaliacoesFiltradas.map((av, i) => (
                <tr key={i}>
                  <td>{av.turmaNome || "—"}</td>
                  <td>{av.disciplinaNome || "—"}</td>
                  <td>{av.professorNome || "—"}</td>
                  <td>{av.tipo || "—"}</td>
                  <td>{av.prova}</td>
                  <td>{av.trabalho}</td>
                  <td>{av.peso || "—"}</td>
                  <td>{av.data || "—"}</td>
                  <td>{av.nota || "—"}</td>
                  <td>{av.media}</td>
                  <td>{av.situacao}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" style={{ textAlign: "center" }}>
                  Nenhuma avaliação registrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="modal-actions">
          <button className="btn-primary" onClick={() => window.print()}>
            🖨️ Imprimir
          </button>
          {/* ✅ Usa o novo componente de download */}
          <BoletimPDFDownloader
            aluno={aluno}
            dadosAluno={dadosAluno}
            avaliacoesFiltradas={avaliacoesFiltradas}
          />
          <button className="btn-secondary" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoletimModal;
