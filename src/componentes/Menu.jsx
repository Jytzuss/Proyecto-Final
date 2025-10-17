import React, { useEffect, useState } from 'react';
import "./Navegacion.css";
import supabase from "../supabaseClient";
import { Link } from 'react-router-dom';
import "./Menu.css";


function Menu() {
  const [userData, setUserData] = useState(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("user");
    window.location.href = "/";
  };


  useEffect(() => {
  const loadUser = () => {
    const localUser = JSON.parse(localStorage.getItem("user"));
    if (!localUser) {
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


  return (
    <>
      <div className='Menu'>
        <div className='flex-nav'>
          <div className='contenedor-nav'>
            <div> <br />
              <div className='ximg'><img src="X.svg" width={25} alt="" /></div> <br />
              <ul>
                <li><a href="/Home" onClick={()=> window.location.reload}><img src="/home.svg" width={40} alt="" /></a><p>Home</p></li> <br />
                <li><img src="/search.svg" width={40} alt="" /><p>Explorer</p></li> <br />
                <li><img src="/notificacion.svg" width={40} alt="" /><p>Notifications</p></li> <br />
                <li><img src="/message.svg" width={40} alt="" /><p>Messages</p></li> <br />
                <li><a href="/Perfil" onClick={()=> window.location.reload}><img src="/profile.svg" width={40} alt="" /></a><p>Profile</p></li> <br />
                <li><img src="/more.svg" width={40} alt="" /><p>More</p></li> <br />
            <div>
              <button className='boton-post'>Post</button>
            </div>
              </ul>
            </div>

            <br /> <br /> <br /> <br />

            <div className='info-user'>
              <div className='user'>
                <img
                  src={userData?.foto_perfil || "/user.svg"}
                  alt="Foto de perfil"
                  className="foto_perfil"
                />
                <p className='menu_fotoperfil'>
                  <b>{userData?.user || "Cargando..."}</b><br />
                </p>
              </div>
            </div>
            <div>
                <button onClick={handleLogout}><img src="/cerrarsesion.svg" alt="" /></button>
              </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Menu;
