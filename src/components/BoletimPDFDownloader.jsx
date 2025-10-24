// src/components/BoletimPDFDownloader.jsx
import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./BoletimPDFDownloader.css";

const BoletimPDFDownloader = ({ aluno, dadosAluno, avaliacoesFiltradas }) => {
  const gerarPDF = () => {
    // colunas da tabela (mesmo que no seu código)
    const colunas = [
      "Turma",
      "Disciplina",
      "Professor",
      "Tipo",
      "Prova",
      "Trabalho",
      "Peso",
      "Nota Final",
      "Média",
      "Situação",
    ];

    // decide orientação: usa landscape quando há muitas colunas
    const useLandscape = colunas.length > 8;
    const doc = new jsPDF(useLandscape ? "l" : "p", "mm", "a4");

    // dimensões e margens
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 12;
    const startYForTable = 78;

    // Cabeçalho
    doc.setFillColor(52, 73, 94);
    doc.rect(0, 0, pageWidth, 26, "F");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text("Boletim Escolar", pageWidth / 2, 16, { align: "center" });

    // Dados do aluno
    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    doc.text("Informações do Aluno", margin + 2, 36);
    doc.setDrawColor(52, 73, 94);
    doc.line(margin + 2, 38, margin + 70, 38);

    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(`Nome: ${dadosAluno?.nome || "—"}`, margin + 2, 46);
    doc.text(`Matrícula: ${dadosAluno?.matricula || "—"}`, margin + 2, 52);
    doc.text(`Email: ${dadosAluno?.email || "—"}`, margin + 2, 58);
    doc.text(`Telefone: ${dadosAluno?.telefone || "—"}`, margin + 2, 64);

    // Prepara linhas
    const linhas =
      avaliacoesFiltradas?.length > 0
        ? avaliacoesFiltradas.map((av) => [
            av.turmaNome || "—",
            av.disciplinaNome || "—",
            av.professorNome || "—",
            av.tipo || "—",
            av.prova ?? "—",
            av.trabalho ?? "—",
            av.peso ?? "—",
            av.nota ?? "—",
            av.media ?? "—",
            av.situacao ?? "—",
          ])
        : [["Nenhum dado encontrado", "", "", "", "", "", "", "", "", ""]];

    // Gera tabela com ajustes para evitar cortes
    autoTable(doc, {
      startY: startYForTable,
      head: [colunas],
      body: linhas,
      theme: "striped",
      tableWidth: pageWidth - margin * 2, // força ajuste na largura da página
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
        halign: "center",
      },
      styles: {
        fontSize: 8.5,      // reduz um pouco para caber melhor
        cellPadding: 2,
        overflow: "linebreak",
        cellWidth: "wrap",  // permite quebra por coluna
        valign: "middle",
        halign: "left",
      },
      columnStyles: {
        0: { cellWidth: "wrap" }, // Turma
        1: { cellWidth: "wrap" }, // Disciplina (texto longo)
        2: { cellWidth: "wrap" }, // Professor
        3: { cellWidth: 20, halign: "center" }, // Tipo
        4: { cellWidth: 20, halign: "center" }, // Prova
        5: { cellWidth: 24, halign: "center" }, // Trabalho
        6: { cellWidth: 14, halign: "center" }, // Peso
        7: { cellWidth: 22, halign: "center" }, // Nota Final
        8: { cellWidth: 14, halign: "center" }, // Média
        9: { cellWidth: "wrap" }, // Situação
      },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      willDrawCell: (data) => {
        // aqui você pode customizar se precisar (ex: reduzir fonte em célula específica)
      },
      // garante que rodapé não sobreponha tabela
      didDrawPage: (data) => {
        const footerY = pageHeight - 10;
        doc.setFontSize(10);
        doc.setTextColor(100);
        const dataAtual = new Date().toLocaleDateString("pt-BR");
        doc.text(`📅 Gerado em: ${dataAtual}`, margin, footerY);
      },
    });

    // Salva PDF
    doc.save(`boletim-${(dadosAluno?.nome || "aluno").replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <button className="pdf-download-btn" onClick={gerarPDF}>
      📄 Baixar Boletim
    </button>
  );
};

export default BoletimPDFDownloader;
