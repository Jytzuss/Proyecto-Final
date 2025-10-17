import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'
import "./Perfil.css"
import supabase from "../supabaseClient";
import EditarPerfil from './EditarPerfil';
import Tendencia from './Tendencia';
import PostDetail from './PostDetail';
import Menu from './Menu';

function Perfil() {
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [counts, setCounts] = useState({ seguidores: 0, siguiendo: 0 });

  useEffect(() => {
    const loadUser = () => {
      const localUser = JSON.parse(localStorage.getItem("user"));
      if (!localUser) return;
      setUserData(localUser);
    };
    loadUser();
  }, []);

  useEffect(() => {
    const loadUserPosts = async () => {
      const localUser = JSON.parse(localStorage.getItem("user"));
      if (!localUser) return;

      const { data, error } = await supabase
        .from("post")
        .select(`
    id,
    tipo,
    contenido,
    imagen_url,
    fecha,
    user_id,
    likes(id, user_id),
    comentarios(id, user_id, contenido, created_at, registro:registro!comentarios_user_id_fkey(user, foto_perfil)),
    registro:registro!fk_post_user(id, user, foto_perfil)
  `)
        .eq("user_id", localUser.id)
        .order("fecha", { ascending: false });

      if (error) {
        console.error("Error cargando posts del usuario:", error);
        return;
      }
      setUserPosts(data);
    };

    loadUserPosts();
  }, []);

  useEffect(() => {
    cargarConteos();
  }, [userData?.id]);

  const cargarConteos = async () => {
    if (!userData?.id) return;

    const { count: seguidores } = await supabase
      .from("seguidores")
      .select("*", { count: 'exact', head: true })
      .eq("seguido_id", userData.id);

    const { count: siguiendo } = await supabase
      .from("seguidores")
      .select("*", { count: 'exact', head: true })
      .eq("seguidor_id", userData.id);

    setCounts({ seguidores: seguidores || 0, siguiendo: siguiendo || 0 });
  };

  const handleDeletePost = async (postId) => {
    const confirmDelete = window.confirm("Seguro que quieres eliminar este post?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("post")
      .delete()
      .eq("id", postId);

    if (error) {
      console.error("Error al eliminar:", error);
      alert("Error al eliminar el post");
      return;
    }

    setUserPosts(userPosts.filter(p => p.id !== postId));
    alert("Post eliminado");
  };

  return (
    <div className="container_padre">
      <Menu></Menu>
      <div className='container-perfil'>
        <p><a href="./home"><img src="arrow.svg" width={40} alt="" /></a></p>

        {showEditModal && (
          <EditarPerfil
            userData={userData}
            onClose={() => setShowEditModal(false)}
            onUpdate={(updatedData) => setUserData(updatedData)}
          />
        )}

        <div className='foto-portada'>
          {userData?.foto_portada ? (
            <img src={userData.foto_portada} alt="Portada" />
          ) : (
            <div className='portada-default'></div>
          )}
        </div>

        <div className='perfil-header'>
          <div className='foto-perfil-container'>
            <img
              src={userData?.foto_perfil || "/user.svg"}
              className='foto_perfil_perfil'
              alt=""
            />
          </div>

          <button
            className='btn-editar-perfil'
            onClick={() => setShowEditModal(true)}>Editar perfil
          </button>
        </div>

        <div className='info-usuario'>
          <h2>{userData?.user}</h2>
          <p>
            Se unió en {userData?.created_at ? new Date(userData.created_at).toLocaleDateString("es-CO", {
              month: "long",
              year: "numeric"
            }) : ""}
          </p>

          {userData?.bio && (
            <p className='bio'>{userData.bio}</p>
          )}


          <div className='estadisticas'>
            <div className='stat'>
              <strong>{userPosts.length}</strong>
              <span>Posts</span>
            </div>
            <div className='stat'>
              <strong>{counts.siguiendo}</strong>
              <span>Siguiendo</span>
            </div>
            <div className='stat'>
              <strong>{counts.seguidores}</strong>
              <span>Seguidores</span>
            </div>
          </div>
        </div>

        <hr />

        <div className='seccion-posts'>
          <h3>Posts</h3>

          <div className="user-posts">
            {userPosts.length === 0 ? (
              <p className='no-posts'>No has publicado nada aún</p>
            ) : (
              userPosts.map((post) => (
                <div
                  key={post.id}
                  className="post-card"
                  onClick={() => setSelectedPost(post)}
                  style={{ cursor: "pointer" }}>

                  <div style={{ justifyContent: "space-between", display: "flex" }}>
                    <div style={{ display: "flex", gap: "7px" }}>
                      <img
                        src={post.registro?.foto_perfil}
                        alt=""
                        style={{ borderRadius: "50px" }}
                        width={50}
                        height={50}
                        className="post-user-avatar" />
                      <h4>{post.registro?.user}</h4>
                    </div>
                    <div>
                      <p>{new Date(post.fecha).toLocaleDateString("es-CO", {
                        day: "numeric",
                        month: "long",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}</p>
                    </div>
                  </div>


                  <div className="post-header-delete">
                      <button style={{ marginLeft: "78%"}}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePost(post.id);
                        }}>Eliminar</button>
                    <div className="post-content">
                    </div>
                      <p>{post.contenido}</p>
                  </div> <br />
                  {post.imagen_url && (
                    post.tipo === "video" ? (
                      <video src={post.imagen_url} controls width="100%" />
                    ) : (
                      <img src={post.imagen_url} alt="" width="100%" className="post-imagee" />
                    )
                  )}

                  <div className="post-likecomen">
                    <span><img src="heart.svg" alt="" />{post.comentarios?.length || 0}</span>
                    <span><img src="/chat.svg" alt="" />{post.likes?.length || 0}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {selectedPost && (
          <PostDetail
            post={selectedPost}
            onClose={() => setSelectedPost(null)}
            userData={userData}
          />
        )}
      </div>

      <div className='Tendencia'>
        <Tendencia></Tendencia>
      </div>
    </div>
  )
}

export default Perfil