import React, { useState, useEffect } from 'react';
import './EvaluationPage.css';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import EvaluationTable from '../components/EvaluationTable';
import NewEvaluationModal from '../components/Modals/NewEvaluationModal';
import BoletimModal from '../components/Modals/BoletimModal';
import { useAuth } from '../context/AuthContext';
import { avaliacaoAPI, alunoAPI, professorAPI, turmaAPI } from '../services/api';

export default function EvaluationPage() {
  const [openNew, setOpenNew] = useState(false);
  const [openBoletim, setOpenBoletim] = useState(false);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [alunosMap, setAlunosMap] = useState({});
  const [professoresMap, setProfessoresMap] = useState({});
  const [disciplinasMap, setDisciplinasMap] = useState({});
  const [turmasMap, setTurmasMap] = useState({});
  const [editData, setEditData] = useState(null);

  const { user } = useAuth();

  // 🔹 Carrega avaliações
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

  // 🔹 Carrega alunos
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

  // 🔹 Carrega professores e disciplinas
  useEffect(() => {
    const carregarProfessores = async () => {
      try {
        const res = await professorAPI.get("/professores");
        const profMap = {};
        const discMap = {};

        res.data.forEach(p => {
          profMap[p.id] = p;
          if (p.disciplinas && Array.isArray(p.disciplinas)) {
            p.disciplinas.forEach(d => {
              discMap[d.id] = d;
            });
          }
        });

        setProfessoresMap(profMap);
        setDisciplinasMap(discMap);
      } catch (err) {
        console.error("Erro ao carregar professores:", err);
        setProfessoresMap({});
        setDisciplinasMap({});
      }
    };
    carregarProfessores();
  }, []);

  // 🔹 Carrega turmas
  useEffect(() => {
    const carregarTurmas = async () => {
      try {
        const res = await turmaAPI.get("/turmas");
        const map = {};
        res.data.forEach(t => (map[t.id] = t));
        setTurmasMap(map);
      } catch {
        setTurmasMap({});
      }
    };
    carregarTurmas();
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
        <Header user={user}/>
        <div className="content">
          <div className="page-header">
            <div>
              <h2 className="page-title">Avaliações</h2>
              <p className="page-subtitle">Gerencie registros de notas, médias e boletins.</p>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              {(user?.tipo_usuario === 'professor' || user?.tipo_usuario === 'admin') && (
                <button className="btn-nova" onClick={() => setOpenNew(true)}>
                  + Nova Avaliação
                </button>
              )}
              {user?.tipo_usuario=== 'aluno' && (
                <button className="btn-nova" onClick={() => setOpenBoletim(true)}>
                  📘 Ver Boletim
                </button>
              )}
            </div>
          </div>

          <EvaluationTable
            avaliacoes={avaliacoes}
            setAvaliacoes={setAvaliacoes}
            alunosMap={alunosMap}
            turmasMap={turmasMap}
            disciplinasMap={disciplinasMap}
            professoresMap={professoresMap}
            showOnlyOwn={user?.tipo_usuario=== 'aluno'}
            onEdit={(a) => { setEditData(a); setOpenNew(true); }}
            onDelete={handleDelete}
          />

          <NewEvaluationModal
            isOpen={openNew}
            onClose={() => { setOpenNew(false); setEditData(null); }}
            onSaveSuccess={handleSave}
            editData={editData}
          />
          
          <BoletimModal
            isOpen={openBoletim}
            onClose={() => setOpenBoletim(false)}
            aluno={{ ...boletimAluno, usuario_id: user?.usuario_id }}
            avaliacoes={avaliacoes}
            setAvaliacoes={setAvaliacoes}
            alunosMap={alunosMap}
            turmasMap={turmasMap}
            disciplinasMap={disciplinasMap}
            professoresMap={professoresMap}
            showOnlyOwn={user?.tipo_usuario=== 'aluno'}
          />
          

        </div>
      </div>
    </div>
  );
}
