import React, { useState } from 'react'
import "./Header.css"
import supabase from "../supabaseClient";




function Header() {
  const [showMenu, setShowMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("for-you");

 const handleLogout = async () => {
  try {
    await supabase.auth.signOut();

    localStorage.removeItem("user");
    localStorage.clear();

    setTimeout(() => {
      window.location.href = "/";
    }, 300);
  } catch (error) {
    console.error("Error al cerrar sesión:", error.message);
  }
};

  const toggleMenu = () => setShowMenu(!showMenu);
  const handleTabClick = (tab) => setActiveTab(tab);
  const closeMenu = () => setShowMenu(false);

  return (
    <div className='contenedor-header'>
      <ul className='seguidos'>
        <li
          className={activeTab === "for-you" ? "active" : ""}
          onClick={() => handleTabClick("for-you")}
        >
          For you
        </li>
        <li
          className={activeTab === "following" ? "active" : ""}
          onClick={() => handleTabClick("following")}
        >
          Following
        </li>
      </ul>
      <button
        className='menu-toggle'
        onClick={toggleMenu}
        title='Menú'
      >
        ☰
      </button>

      {showMenu && (
        <div
          className='menu-overlay'
          onClick={closeMenu}
        />
      )}

      {showMenu && (
        <div className='menu-slide'>
          <button 
            className='close-menu-btn'
            onClick={closeMenu}
            title='Cerrar menú'>✕</button>
          <h3>Menú</h3>
          <a href="./Perfil" onClick={closeMenu}>Perfil</a>
          <a href="./tendencia" onClick={closeMenu}>Tendencias</a>
          <a href="/" onClick={handleLogout}>Cerrar sesión</a>
        </div>
      )}
    </div>
  )
}

export default Header;