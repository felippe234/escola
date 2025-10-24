import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./LoginForm.css";

const LoginForm = () => {
  const [form, setForm] = useState({ email: "", senha: "" });
  const [modal, setModal] = useState(null); 
  const [modalData, setModalData] = useState({ email: "", senhaAtual: "", novaSenha: "", confirmarSenha: "" });

  const navigate = useNavigate();
  const { login, user } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await login(form.email, form.senha);
    if (!result.success) {
      alert(result.error);
      return;
    }

    if (result.user.primeira_senha === 1) {
      setModal("alterar"); // 🚨 força troca
    } else {
      navigate("/dashboard");
    }
  };

  const handleModalChange = (e) => {
    setModalData({ ...modalData, [e.target.name]: e.target.value });
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();

    if (modal === "alterar") {
      if (modalData.novaSenha !== modalData.confirmarSenha) {
        alert("As senhas não coincidem!");
        return;
      }

      try {
        const response = await fetch("http://localhost:4005/auth/alterar-senha", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuario_id: user.usuario_id,
            nova_senha: modalData.novaSenha,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          alert(data.erro || "Erro ao alterar senha");
          return;
        }

        alert("Senha alterada com sucesso!");
        setModal(null);
        navigate("/dashboard");

      } catch (err) {
        console.error(err);
        alert("Erro na conexão");
      }
    }

    setModalData({ email: "", senhaAtual: "", novaSenha: "", confirmarSenha: "" });
  };

  return (
    <div>
      <form className="login-form" onSubmit={handleSubmit}>
        <h3>Acesse sua conta</h3>

        <div className="form-group">
          <label htmlFor="email">E-mail</label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="senha">Senha</label>
          <input
            type="password"
            id="senha"
            name="senha"
            value={form.senha}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn-login">Entrar</button>

        <div className="links">
          <button type="button" className="link-button" onClick={() => setModal("recuperar")}>
            Esqueci minha senha
          </button>
        </div>
      </form>

      {/* Modal */}
      {modal === "alterar" && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Alterar senha</h3>
            <form onSubmit={handleModalSubmit}>
              <div className="form-group">
                <label htmlFor="novaSenha">Nova senha</label>
                <input
                  type="password"
                  id="novaSenha"
                  name="novaSenha"
                  value={modalData.novaSenha}
                  onChange={handleModalChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmarSenha">Confirmar nova senha</label>
                <input
                  type="password"
                  id="confirmarSenha"
                  name="confirmarSenha"
                  value={modalData.confirmarSenha}
                  onChange={handleModalChange}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-login">Confirmar</button>
                <button type="button" className="btn-cancel" onClick={() => setModal(null)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
