import React, { useState } from 'react';
import "./Registro.css";
import { useNavigate } from 'react-router-dom';
import supabase from "../supabaseClient";



function Registro({ setShowModal }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    user: '',
    numero: '',
    contrasena: '',
    fecha: '',
    foto_perfil: "",
  });

  const [fotoFile, setFotoFile] = useState(null);
  const [codigo, setCodigo] = useState('');
  const [codigoGenerado, setCodigoGenerado] = useState('');
  const [etapa, setEtapa] = useState('registro');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFotoFile(file);
  };

  const generarCodigo = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  
  const validarNumeroColombia = (num) => /^3\d{9}$/.test(num);

  try {
    if (!validarNumeroColombia(formData.numero)) {
      alert("Numero de telefono no valido");
      setLoading(false);
      return;
    }

    const { data: userExistente } = await supabase
      .from("registro")
      .select("*")
      .eq("user", formData.user)
      .maybeSingle();

    if (userExistente) {
      alert("Este nombre de usuario ya está en uso");
      setLoading(false);
      return;
    }

    const { data: numeroExistente } = await supabase
      .from("registro")
      .select("*")
      .eq("numero", formData.numero)
      .maybeSingle();

    if (numeroExistente) {
      alert("Este número ya está vinculado a otra cuenta");
      setLoading(false);
      return;
    }

    const nuevoCodigo = generarCodigo();
    setCodigoGenerado(nuevoCodigo);
    setEtapa("verificacion");

    alert(`Copia este codigo o anotalo, para verificar tu cuenta en la siguiente vista: ${nuevoCodigo}`);
  } catch (err) {
    console.error(err);
    alert("Error al generar el código");
  } finally {
    setLoading(false);
  }
};

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (codigo.trim() === codigoGenerado.trim()) {
        let fotoUrl = null;

        if (fotoFile) {
          const fileName = `${Date.now()}-${fotoFile.name}`;
          console.log("Subiendo:", fileName, fotoFile);

          const { error: uploadError } = await supabase.storage
            .from("Imagenes")
            .upload(fileName, fotoFile);

          if (uploadError) {
            console.error(uploadError);
            alert("Error al subir la foto de perfil, puedes hacerlo más adelante en tu perfil");
            return;
          }

          const { data } = supabase.storage.from("Imagenes").getPublicUrl(fileName);
          fotoUrl = data.publicUrl;
        }

        const datosFinales = { ...formData, foto_perfil: fotoUrl };

        const { error } = await supabase.from("registro").insert([datosFinales]);
        if (error) throw error;

        const { data: userRegistrado } = await supabase
          .from("registro")
          .select("*")
          .eq("numero", formData.numero)
          .maybeSingle();

        if (userRegistrado) {
          localStorage.setItem("user", JSON.stringify(userRegistrado));
        }

        window.location.href = "/home";
      } else {
        alert("Código incorrecto, inténtalo de nuevo");
      }

    } catch (err) {
      console.error(err);
      alert("Error al verificar el código");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='ventana'>
      <div className='cerrar'>
        <div className='x' onClick={() => setShowModal(false)}>
          Cerrar
        </div>
        <div className='xx'>
          <img src="X.svg" width={35} alt="" />
        </div>
      </div>

      <div className='datos'>
        <h2>{etapa === 'registro' ? 'Crea tu cuenta' : 'Verificacion de dos pasos'}</h2>

        {etapa === 'registro' ? (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name='user'
              autoComplete='off'
              className='input-datos'
              placeholder='   Usuario'
              value={formData.user}
              onChange={handleChange}
            />
            <br /><br />

            
            <input
              type="number"
              name="numero"
              className='input-datos'
              autoComplete='off'
              placeholder='   +57 - Teléfono'
              
              value={formData.numero}
              onChange={(e) => {
                if (e.target.value.length <= 10)handleChange(e);
              }}
            />
            <br /><br />

            <input
              type="password"
              name="contrasena"
              autoComplete='off'
              className='input-datos'
              placeholder='   Contraseña'
              value={formData.contrasena}
              onChange={handleChange}
            />
            <br /> <br />

            <h3>Fecha de nacimiento</h3>
            <p>Confirma tu edad real</p> <br />

            <input
              type="date"
              name="fecha"
              id="date"
              value={formData.fecha}
              onChange={handleChange}
            />
            <br /> <br />

            <label>Agrega una foto de perfil</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            <br />

            <button className='next' disabled={loading}>
              {loading ? 'Enviando...' : 'Siguiente'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode}>
            <h5>Ingresa el CODIGO de verificacion de dos pasos</h5>
            <input
              type="number"
              className='input-check'
              placeholder="Código de verificación"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
            /> <br /> <br />
            <button className='next' disabled={loading}>
              {loading ? 'Verificando...' : 'Verificar'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Registro;
