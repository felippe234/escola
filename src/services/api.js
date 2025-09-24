// src/services/api.js
import axios from 'axios';

// ✅ API de Turmas (porta 4004, por exemplo)
export const turmaAPI = axios.create({
  baseURL: 'http://localhost:4004',
  headers: { 'Content-Type': 'application/json' },
});

// API de Avaliações (porta 4000)
export const avaliacaoAPI = axios.create({
  baseURL: 'http://localhost:4000',
  headers: { 'Content-Type': 'application/json' },
});

// API de Professores (porta 4002)
export const professorAPI = axios.create({
  baseURL: 'http://localhost:4002',
  headers: { 'Content-Type': 'application/json' },
});

// API de Comunicados (porta 4003)
export const comunicadoAPI = axios.create({
  baseURL: 'http://localhost:4003',
  headers: { 'Content-Type': 'application/json' },
});

// API de Alunos (porta 4001)
export const alunoAPI = axios.create({
  baseURL: 'http://localhost:4001',
  headers: { 'Content-Type': 'application/json' },
});
// ✅ API de Turma-Aluno (porta 4005)
export const turmaAlunoAPI = axios.create({
  baseURL: 'http://localhost:4006',
  headers: { 'Content-Type': 'application/json' },
});