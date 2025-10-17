import React, { useState } from "react";
import supabase from "../supabaseClient";
import "./Comentarios.css";

function Comentarios({
  postId,
  userId,
  userName,
  userFoto,
  comentarios,
  onComentarioAdded
}) {
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAgregarComentario = async () => {
    if (!nuevoComentario.trim()) {
      alert("Escribe algo para comentar");
      return;
    }

    if (!userId) {
      alert("Debes estar logueado para comentar");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("comentarios")
        .insert([{
          post_id: postId,
          user_id: userId,
          contenido: nuevoComentario
        }]);

      if (error) throw error;

      setNuevoComentario("");
      onComentarioAdded();
    } catch (error) {
      console.error("Error al agregar comentario:", error);
      alert("Error al agregar el comentario");
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarComentario = async (comentarioId) => {
    if (!window.confirm("¿Eliminar comentario?")) return;

    try {
      const { error } = await supabase
        .from("comentarios")
        .delete()
        .eq("id", comentarioId)
        .eq("user_id", userId);

      if (error) throw error;

      onComentarioAdded();
    } catch (error) {
      console.error("Error al eliminar comentario:", error);
      alert("Error al eliminar el comentario");
    }
  };

  return (
    <div className="comentarios-container">
      <div className="comentario-form">
        <img
          src={userFoto || "/user.svg"}
          alt=""
          className="user-avatar"
        />
        <div className="form-input">
          <input
            type="text"
            placeholder="Post your reply"
            value={nuevoComentario}
            onChange={(e) => setNuevoComentario(e.target.value)}
            className="comentario-input"
          />
          <button
            onClick={handleAgregarComentario}
            disabled={loading || !nuevoComentario.trim()}
            className="reply-btn"
          >
            {loading ? "Enviando..." : "Reply"}
          </button>
        </div>
      </div>

      <div className="comentarios-list">
        {comentarios && comentarios.length > 0 ? (
          comentarios.map((comentario) => (
            <div key={comentario.id} className="comentario-item">
              <img
                src={comentario.registro?.foto_perfil || "/user.svg"}
                alt=""
                className="comentario-avatar"
              />
              <div className="comentario-content">
                <div className="comentario-header">
                  <h4>{comentario.registro?.user}</h4>
                  <p>@{comentario.registro?.user?.toLowerCase()}</p>
                  <span className="separador">·</span>
                  <p className="comentario-fecha">
                    {new Date(comentario.created_at).toLocaleDateString("es-CO", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                  {comentario.user_id === userId && (
                    <button
                      className="delete-btn"
                      onClick={() => handleEliminarComentario(comentario.id)}
                      title="Eliminar">✕</button>
                  )}
                </div>
                <p className="comentario-texto">{comentario.contenido}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="no-comentarios">No hay comentarios aún</p>
        )}
      </div>
    </div>
  );
}

export default Comentarios;