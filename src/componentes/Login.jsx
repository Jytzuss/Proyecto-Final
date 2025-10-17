import "./Login.css";
import React, { useState, useEffect } from 'react';
import supabase from "../supabaseClient";
import Registro from './Registro';
import Iniciosesion from "./Iniciosesion";



function Login() {
  const [showModal, setShowModal] = useState(false);
  const [ShowLoginModal, setShowLoginModal] = useState(false);

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: "http://localhost:5173/home" }
    });

    if (error) {
      console.error("Error en Google login:", error.message);
      alert("Error al iniciar sesión con Google");
    }
  };

  useEffect(() => {
  const checkUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return;

    const registroRow = {
      auth_id: user.id,
      user: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
      foto_perfil: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
      fecha: new Date().toISOString(),
      contrasena: null,
      numero: null
    };

    const { data: registroData, error: upsertError } = await supabase
      .from("registro")
      .upsert([registroRow], { 
        onConflict: "auth_id",
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (upsertError) {
     
      return;
    }
    localStorage.setItem("user", JSON.stringify({
      id: registroData.id,
      auth_id: registroData.auth_id,
      user: registroData.user,
      foto_perfil: registroData.foto_perfil,
      numero: registroData.numero,
      fecha: registroData.fecha,
      created_at: registroData.created_at
    }));


    window.location.href = "/home";
  };

  checkUser();
}, []);

  return (
    <div className='Contenedor-loginnn'>
      <div className='Contenedor-login'>
      {showModal && <Registro setShowModal={setShowModal} />}
      {ShowLoginModal && <Iniciosesion setShowLoginModal={setShowLoginModal} />}

      <div className='imagen-login'>
        <img src="X.svg" width={300} alt="" />
      </div>

      <div className='login'>
        <h1>Lo que está <br />pasando ahora</h1> <br />
        <h2>Únete Hoy</h2> <br />

        <button className='boton-google' onClick={handleGoogleLogin}>
          <img src="google.svg" width={19} height={19} alt="" />
          <p>Registrarse con Google</p>
        </button>
        <p className="tyc">O</p>
        <button className='boton-register' onClick={() => setShowModal(true)}>
          Crear cuenta
        </button> <br />

        <p className='tyc'>
          Al registrarte, aceptas los <span className="color">Términos de servicio</span> y <span className="color">la Política de <br /> privacidad</span>, incluida la política de <span className="color">Uso de Cookies</span>.
        </p> <br />
        <br />
        <h3>¿Ya tienes una cuenta?</h3>
        <button className='boton-login' onClick={() => setShowLoginModal(true)}>
          Iniciar sesión
        </button>
      </div>
    </div>
    </div>
  );
}

export default Login;
