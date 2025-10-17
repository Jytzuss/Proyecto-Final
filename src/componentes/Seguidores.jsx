import React, { useState, useEffect } from "react";
import supabase from "../supabaseClient";
import FollowButton from "./FollowButton";
import "./SeguidoresModal.css";

function Seguidores({ userId, type, onClose, currentUserId }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarUsuarios();
  }, [userId, type]);

  const cargarUsuarios = async () => {
    setLoading(true);

    try {
      if (type === "seguidores") {
        const { data } = await supabase
          .from("seguidores")
          .select("seguidor_id, registro:registro!fk_registro_seg(id, user, foto_perfil)")
          .eq("seguido_id", userId);

        setUsuarios(data?.map(s => ({ ...s.registro, seguidor_id: s.seguidor_id })) || []);
      } else {
        const { data } = await supabase
          .from("seguidores")
          .select("seguido_id, registro:registro!fk_registro_seg(id, user, foto_perfil)")
          .eq("seguidor_id", userId);

        setUsuarios(data?.map(s => ({ ...s.registro, seguido_id: s.seguido_id })) || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{type === "seguidores" ? "Seguidores" : "Siguiendo"}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="usuarios-list">
          {loading ? (
            <p>Cargando...</p>
          ) : usuarios.length === 0 ? (
            <p>No hay usuarios</p>
          ) : (
            usuarios.map((user) => (
              <div key={user.id} className="usuario-item">
                <img
                  src={user.foto_perfil || "/user.svg"}
                  alt=""
                  className="avatar"
                />
                <div className="usuario-info">
                  <h4>{user.user}</h4>
                  <p>@{user.user?.toLowerCase()}</p>
                </div>
                <FollowButton
                  userId={user.id}
                  currentUserId={currentUserId}
                  onFollowChange={cargarUsuarios}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Seguidores;