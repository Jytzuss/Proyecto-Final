import React, { useState } from 'react';
import "./Iniciosesion.css";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";

function Iniciosesion({ setShowLoginModal }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ numero: "", contrasena: "" });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.numero || !formData.contrasena) {
            alert("Por favor, llena todos los campos");
            return;
        }

        try {
            const { data, error } = await supabase
                .from("registro")
                .select("*")
                .eq("numero", formData.numero)
                .eq("contrasena", formData.contrasena)
                .single();

            if (data) {
                localStorage.setItem("user", JSON.stringify(data));
            }

            if (error || !data) {
                alert("Número o contraseña incorrectos");
                return;
            }

            setShowLoginModal(false);
            window.location.href = "/home";
        } catch (err) {
            console.error("Error en login:", err.message);
            alert("Error en inicio de sesión: " + err.message);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: "http://localhost:5173/home"
                }
            });

            if (error) throw error;
            console.log("Redirigiendo con Google:", data);
        } catch (err) {
            console.error("Error en Google Login:", err.message);
            alert("Error al iniciar con Google");
        }
    };

    return (
        <div className='ventana'>
            <div className='cerrar'>
                <div className='x' onClick={() => setShowLoginModal(false)}>
                    Cerrar
                </div>
                <div className='xx'>
                    <img src="X.svg" width={30} alt="" />
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className='datos'>
                    <h2>Iniciar sesión en X</h2>
                    <br />
                    <label>Ingresa tu numero de telefono y contraseña</label> <br /> <br />
                    <input
                        type="number"
                        name="numero"
                        autoComplete='off'
                        className='input-datos'
                        placeholder='Teléfono'
                        value={formData.numero}
                        onChange={handleChange}
                    />
                    <br /><br />
                    <input
                        type="password"
                        name="contrasena"
                        className='input-datos'
                        placeholder='Contraseña'
                        value={formData.contrasena}
                        onChange={handleChange}
                    />
                    <br /><br /> <br />
                    <button className='next-login'>Siguiente</button>
                    <br /><br /> <br />
                    <button type="button" className='iniciar-google' onClick={handleGoogleLogin}>
                        <img src="google.svg" width={19} height={19} alt="" />
                        <p>Iniciar sesion con Google</p>
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Iniciosesion;
