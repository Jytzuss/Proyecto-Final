import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import "./Perfil.css";
import supabase from "../supabaseClient";
import EditarPerfil from './EditarPerfil';
import PostDetail from './PostDetail';
import BotonSeguir from './BotonSeguir';
import Tendencia from './Tendencia';
import Menu from './Menu';
import "./PerfilPublico.css"

function PerfilPublico() {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [counts, setCounts] = useState({ seguidores: 0, siguiendo: 0 });

  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem("user"));
    setCurrentUserId(localUser?.id);
    loadUser();
    loadUserPosts();
    cargarConteos();
  }, [userId]);

  const loadUser = async () => {
    const { data } = await supabase
      .from("registro")
      .select("*")
      .eq("id", userId)
      .single();

    setUserData(data);
  };

  const loadUserPosts = async () => {
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
      .eq("user_id", userId)
      .order("fecha", { ascending: false });

    if (error) {
      console.error("Error cargando posts del usuario:", error);
      return;
    }

    setUserPosts(data);
  };

  const cargarConteos = async () => {
    const { count: seguidores } = await supabase
      .from("seguidores")
      .select("*", { count: 'exact', head: true })
      .eq("seguido_id", userId);

    const { count: siguiendo } = await supabase
      .from("seguidores")
      .select("*", { count: 'exact', head: true })
      .eq("seguidor_id", userId);

    setCounts({ seguidores: seguidores || 0, siguiendo: siguiendo || 0 });
  };

  if (!userData) return <div>Cargando...</div>;

  return (
    <div className="container_padre">
      <Menu></Menu>
      <div className='container-perfil'>
        <p><a href="/home"><img src="/arrow.svg" width={40} alt="" /></a></p>

 
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

          {currentUserId === userId ? (
            <button className='btn-editar-perfil'>Editar perfil</button>
          ) : (
            <BotonSeguir
              userId={userId}
              currentUserId={currentUserId}
              onFollowChange={cargarConteos}
            />
          )}
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
              <p className='no-posts'>No hay posts</p>
            ) : (
              userPosts.map((post) => (
                <div
                  key={post.id}
                  className="post-card"
                  onClick={() => setSelectedPost(post)}
                  style={{ cursor: "pointer" }}>
                    <div style={{justifyContent:"space-between", display:"flex", gap:"20px"}}>
                    <div style={{display:"flex", gap:"7px"}}>
                      <img
                      src={userData?.foto_perfil}
                      alt=""
                      style={{borderRadius:"50px"}}
                      width={50}
                      height={50}
                      className="post-user-avatar" />
                    <h4>{userData?.user}</h4>
                    </div>
                    <div>
                      <p style={{fontSize:"9px"}}>{new Date(post.fecha).toLocaleDateString("es-CO", {
                        day: "numeric",
                        month: "long",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}</p>
                    </div>
                  </div> 
                  <div className="post-content">
                  </div> <br />
                    <p>{post.contenido}</p>
                  {post.imagen_url && (
                    post.tipo === "video" ? (
                      <video src={post.imagen_url} controls width={400} height={500} style={{ marginLeft: "100px" }} className="post-imagee" />
                    ) : (
                      <img src={post.imagen_url} alt="" width={500} className="post-imagee" />
                    )
                  )}
                  <div className="post-likecomen">
                    <div><img src="/chat.svg" alt="" />{post.comentarios?.length || 0}</div>
                    <div><img src="/heart.svg" alt="" />{post.likes?.length || 0}</div>
                  </div> <br />
                </div>
              ))
            )}
          </div>
        </div>
      </div>


      {selectedPost && (
        <PostDetail
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          userData={{ id: currentUserId, user: userData?.user, foto_perfil: userData?.foto_perfil }}
        />
      )}

      <div className='Tendencia'>
        <Tendencia></Tendencia>
      </div>
    </div>
  );
}

export default PerfilPublico;