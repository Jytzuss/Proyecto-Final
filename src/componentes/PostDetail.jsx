import React, { useState, useEffect } from "react";
import supabase from "../supabaseClient";
import "./PostDetail.css";
import Likes from "./Likes";
import Comentarios from "./Comentarios";
import BotonSeguir from "./BotonSeguir";

function PostDetail({ post, onClose, userData }) {
  console.log("Post recibido en PostDetail:", post);
  const [likes, setLikes] = useState(post?.likes || []);
  const [comentarios, setComentarios] = useState(post?.comentarios || []);

  const handleLikeChange = (newLikes) => {
    setLikes(newLikes);
  };

  const handleComentarioAdded = async () => {
    const { data } = await supabase
      .from("post")
      .select("comentarios(id, user_id, contenido, created_at, registro:registro!comentarios_user_id_fkey(user, foto_perfil))")
      .eq("id", post.id)
      .single();

    if (data?.comentarios) {
      setComentarios(data.comentarios);
    }
  };

  return (
    <div className="post-detail-overlay" onClick={onClose}>
      <div className="post-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="post-detail-header">
          <button className="close-btn" onClick={onClose}>✕</button>
          <h2>Post</h2>
          <div></div>
        </div>

        <div className="post-detail-content">
          {/* Sección del autor con botón seguir */}
          <div className="post-author">
            <img
              src={post.registro?.foto_perfil || "/user.svg"}
              alt=""
              className="avatar"
            />
            <div className="author-info">
              <h3>{post.registro?.user}</h3>
              <p>@{post.registro?.user?.toLowerCase()}</p>
            </div>
            <BotonSeguir
              userId={post.registro?.id}
              currentUserId={userData?.id}
              onFollowChange={() => { }}
            />
          </div>


          <div className="post-body">
            <p>{post.contenido}</p>
            {post.imagen_url && (
              post.tipo === "video" ? (
                <video src={post.imagen_url} controls width={400} height={500} style={{ marginLeft: "100px" }} className="post-imagee" />
              ) : (
                <img src={post.imagen_url} alt="" width="100%" className="post-imagee" />
              )
            )}
          </div>

          <div className="post-date">
            <p>
              {new Date(post.fecha).toLocaleDateString("es-CO", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </p>
          </div>

          <div className="post-actions">
            <Likes
              postId={post.id}
              userId={userData?.id}
              likes={likes}
              onLikeChange={handleLikeChange}
            />
            <button className="action-btn">
              <img src="/chat.svg" alt="Comentar" width={18} />
            </button>

          </div>

          <Comentarios
            postId={post.id}
            userId={userData?.id}
            userName={userData?.user}
            userFoto={userData?.foto_perfil}
            comentarios={comentarios}
            onComentarioAdded={handleComentarioAdded}
          />
        </div>
      </div>
    </div>
  );
}

export default PostDetail;