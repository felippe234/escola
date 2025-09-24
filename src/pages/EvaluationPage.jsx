import React, { useState, useEffect } from 'react';
import './EvaluationPage.css';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import EvaluationTable from '../components/EvaluationTable';
import NewEvaluationModal from '../components/Modals/NewEvaluationModal';
import BoletimModal from '../components/Modals/BoletimModal';
import { useAuth } from '../context/AuthContext';
import { avaliacaoAPI, alunoAPI } from '../services/api';

export default function EvaluationPage() {
  const [openNew, setOpenNew] = useState(false);           // Controle do modal de nova avaliação
  const [openBoletim, setOpenBoletim] = useState(false);   // Controle do modal do boletim
  const [avaliacoes, setAvaliacoes] = useState([]);        // Lista de avaliações
  const [alunosMap, setAlunosMap] = useState({});          // Mapa de alunos por ID
  const [editData, setEditData] = useState(null);          // Avaliação que está sendo editada

  const { user } = useAuth();

  // 🔹 Carrega avaliações do backend
  useEffect(() => {
    const carregarAvaliacoes = async () => {
      try {
        const res = await avaliacaoAPI.get("/avaliacoes");
        setAvaliacoes(res.data);
      } catch (err) {
        console.error("Erro ao carregar avaliações:", err);
        setAvaliacoes([]);
      }
    };
    carregarAvaliacoes();
  }, []);

  // 🔹 Carrega alunos e monta mapa por ID
  useEffect(() => {
    const carregarAlunos = async () => {
      try {
        const res = await alunoAPI.get("/alunos");
        const map = {};
        res.data.forEach(a => (map[a.id] = a));
        setAlunosMap(map);
      } catch {
        setAlunosMap({});
      }
    };
    carregarAlunos();
  }, []);

  // 🔹 Boletim do aluno logado
  const boletimAluno = {
    nome: user?.nome || "Aluno",
    notas: avaliacoes
      .filter(av => av.aluno_id === user?.id)
      .map(av => {
        const prova = Number(av.prova ?? 0);
        const trabalho = Number(av.trabalho ?? 0);
        const media = ((prova * 2 + trabalho) / 3).toFixed(1);
        const situacao = media >= 6 ? "✅ Aprovado" : media >= 4 ? "⚠️ Recuperação" : "❌ Reprovado";
        return {
          disciplina: av.tipo || "—",
          nota: Number(media),
          situacao
        };
      })
  };

  // 🔹 Salva nova avaliação ou atualiza existente
  const handleSave = (avaliacao) => {
    if (editData) {
      setAvaliacoes(prev =>
        prev.map(a => (a.id === avaliacao.id ? avaliacao : a))
      );
    } else {
      setAvaliacoes(prev => [...prev, avaliacao]);
    }
    setEditData(null);
    setOpenNew(false);
  };

  // 🔹 Deleta avaliação
  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta avaliação?")) {
      try {
        await avaliacaoAPI.delete(`/avaliacoes/${id}`);
        setAvaliacoes(prev => prev.filter(a => a.id !== id));
      } catch (err) {
        console.error("Erro ao excluir avaliação:", err);
        alert("Erro ao excluir avaliação.");
      }
    }
  };

  return (
    <div className="evaluation-page">
      <Sidebar />
      <div className="main">
        <Header />
        <div className="content">
          <div className="page-header">
            <div>
              <h2 className="page-title">Avaliações</h2>
              <p className="page-subtitle">Gerencie registros de notas, médias e boletins.</p>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              {/* Professores e admins podem criar avaliações */}
              {(user?.role === 'professor' || user?.role === 'admin') && (
                <button className="btn-nova" onClick={() => setOpenNew(true)}>
                  + Nova Avaliação
                </button>
              )}

              {/* Aluno só pode ver boletim */}
              {user?.role === 'aluno' && (
                <button className="btn-nova" onClick={() => setOpenBoletim(true)}>
                  📘 Ver Boletim
                </button>
              )}
            </div>
          </div>

          {/* Tabela de avaliações */}
          <EvaluationTable
            avaliacoes={avaliacoes}
            setAvaliacoes={setAvaliacoes}
            alunosMap={alunosMap}
            showOnlyOwn={user?.role === 'aluno'}
            onEdit={(a) => { setEditData(a); setOpenNew(true); }}
            onDelete={handleDelete}
          />

          {/* Modal de nova/edição de avaliação */}
          <NewEvaluationModal
            isOpen={openNew}
            onClose={() => { setOpenNew(false); setEditData(null); }}
            onSaveSuccess={handleSave}
            editData={editData}
          />

          {/* Modal de boletim do aluno */}
          <BoletimModal
            isOpen={openBoletim}
            onClose={() => setOpenBoletim(false)}
            aluno={boletimAluno}
          />
        </div>
      </div>
    </div>
  );
}
