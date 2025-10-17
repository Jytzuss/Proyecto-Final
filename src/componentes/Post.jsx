import React, { useState, useEffect } from "react";
import "./Post.css";
import supabase from "../supabaseClient";
import Header from "./Header";
import Tendencia from "./Tendencia";
import Menu from "./Menu";
import PostDetail from "./PostDetail";
import Likes from "./Likes";
import { useNavigate } from 'react-router-dom';




function Post() {
  const [imageFile, setImageFile] = useState(null);
  const [text, setText] = useState("");
  const [posts, setPosts] = useState([]);
  const [preview, setPreview] = useState(null);
  const [userData, setUserData] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = () => {
      const localUser = JSON.parse(localStorage.getItem("user"));
      if (!localUser) {
        console.log("No hay usuario en localStorage");
        return;
      }

      setUserData({
        id: localUser.id,
        user: localUser.user,
        foto_perfil: localUser.foto_perfil
      });
    };

    loadUser();
  }, []);

  useEffect(() => {
    const loadPosts = async () => {
      const { data, error } = await supabase
        .from("post")
        .select(`
          id,
          tipo,
          contenido,
          imagen_url,
          fecha,
          user_id,
          registro:registro!fk_post_user (
            id,
            user,
            foto_perfil
          ),
          likes(id, user_id),
          comentarios(id, user_id, contenido, created_at, registro:registro!comentarios_user_id_fkey(user, foto_perfil))
        `)
        .order("fecha", { ascending: false });

      if (error) console.error("Error cargando posts:", error);
      else setPosts(data);
    };

    loadPosts();
  }, []);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handlePostt = async () => {
    if (!text && !imageFile) return alert("Escribe algo o sube una imagen");

    let imageUrl = null;

    if (imageFile) {
      const fileName = `${Date.now()}-${imageFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("Imagenes")
        .upload(fileName, imageFile);

      if (uploadError) {
        console.error(uploadError);
        alert("Error al subir imagen");
        return;
      }

      const { data: publicData } = supabase.storage
        .from("Imagenes")
        .getPublicUrl(fileName);

      imageUrl = publicData?.publicUrl || null;
    }

    const userId = userData?.id;

    const { data: newPost, error } = await supabase
      .from("post")
      .insert([
        {
          user_id: userId,
          tipo: imageFile ? (imageFile.type.startsWith("video") ? "video" : "imagen") : "texto",
          contenido: text,
          imagen_url: imageUrl,
          fecha: new Date().toISOString(),
        },
      ])
      .select(`
        id,
        tipo,
        contenido,
        imagen_url,
        fecha,
        user_id,
        registro:registro!fk_post_user (
          id,
          user,
          foto_perfil
        ),
        likes(id, user_id),
        comentarios(id, user_id, contenido, created_at, registro:registro!comentarios_user_id_fkey(user, foto_perfil))
      `)
      .single();

    if (error) {
      console.error(error);
      alert("Error al publicar el post");
      return;
    }

    setPosts([newPost, ...posts]);
    setImageFile(null);
    setPreview(null);
    document.getElementById("fileinput").value = "";
    setText("");
  };

  const handleLikeChange = (postId, newLikes) => {
    setPosts(posts.map(p =>
      p.id === postId ? { ...p, likes: newLikes } : p
    ));
  };

  return (
    <div className="tresvistas">
      <Menu />
      <div className="container-padre">
        <Header />
        <div className="container-post">
          {preview && (
            <div className="cuadro-modal">
              <div className="cuadro contenido">
                <button className="cerrar-btn" onClick={() => setPreview(null)}>Subir</button>
                <br /> <br />
                {imageFile?.type.startsWith("video") ? (
                  <video src={preview} controls width="100%" />
                ) : (
                  <img src={preview} alt="preview" width="100%" />
                )}
              </div>
            </div>
          )}

          <div className="cuadro_post">
            <div className="flex-uno">
              <div>
                <img
                  src={userData?.foto_perfil || "/user.svg"}
                  alt=""
                  className="foto_perfil"
                />
              </div>
              <div>
                <input
                  type="text"
                  className="input-post"
                  placeholder="¿Qué estás haciendo?"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>
            </div>
            <br />
            <div className="flex-posttt">
              <div>
                <label htmlFor="fileinput">
                  <img src="files.svg" width={25} alt="" />
                </label>
                <input
                  type="file"
                  id="fileinput"
                  onChange={handleFile}
                  accept="image/*,video/*"
                  style={{ display: "none" }}
                />
              </div>
              <div>
                <button className="btn-post" onClick={handlePostt}>
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="contai-posts">
          <div className="containerr-post">


            {posts.map((p) => (
              <div key={p.id} className="post-items">
                <div className="img-user-text">
                  <div className="rodar-img">
                    <img
                      src={p.registro?.foto_perfil || "/user.svg"}
                      className="foto_perfil"
                      alt=""
                      onClick={() => navigate(`/perfil/${p.registro?.id}`)}
                      style={{ cursor: "pointer" }}
                    />
                  </div>

                  <div className="post-user-info">
                    <div
                      className="post-header"
                      onClick={() => navigate(`/perfil/${p.registro?.id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <h3>{p.registro?.user || "usuario desconocido"}</h3>
                      <p style={{fontSize:"9px"}}>
                        {new Date(p.fecha).toLocaleDateString("es-CO", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="post-content"
                  onClick={() => setSelectedPost(p)}
                  style={{ cursor: "pointer" }}><p>{p.contenido}</p></div>
                {p.imagen_url && (
                  p.tipo === "video" ? (
                    <video src={p.imagen_url} controls width="100%" className="foto_post" />
                  ) : (
                    <img src={p.imagen_url} alt="" className="foto_post" />
                  )
                )}

                <div className="like_comen">
                  <div className="comen-count">
                    <img src="chat.svg" width={15} alt="" />
                    <span>{p.comentarios?.length || 0}</span>
                  </div>
                  <Likes
                    postId={p.id}
                    userId={userData?.id}
                    likes={p.likes || []}
                    onLikeChange={(newLikes) => handleLikeChange(p.id, newLikes)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="Tendencia">
        <Tendencia />
      </div>

      {selectedPost && (
        <PostDetail
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          userData={userData}
        />
      )}
    </div>
  );
}

export default Post;