import React, { useState } from 'react';
import supabase from "../supabaseClient";
import "./EditarPerfil.css";

function EditarPerfil({ userData, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    user: userData?.user || '',
    bio: userData?.bio || '',
    numero: userData?.numero || ''
  });
  
  const [fotoPerfilFile, setFotoPerfilFile] = useState(null);
  const [fotoPortadaFile, setFotoPortadaFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let fotoPerfilUrl = userData?.foto_perfil;
      let fotoPortadaUrl = userData?.foto_portada;

      if (fotoPerfilFile) {
        const fileName = `perfil-${Date.now()}-${fotoPerfilFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("Imagenes")
          .upload(fileName, fotoPerfilFile);

        if (uploadError) {
          alert("Error al subir foto de perfil");
          setLoading(false);
          return;
        }

        const { data } = supabase.storage
          .from("Imagenes")
          .getPublicUrl(fileName);
        
        fotoPerfilUrl = data.publicUrl;
      }
      if (fotoPortadaFile) {
        const fileName = `portada-${Date.now()}-${fotoPortadaFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("Imagenes")
          .upload(fileName, fotoPortadaFile);

        if (uploadError) {
          alert("Error al subir foto de portada");
          setLoading(false);
          return;
        }

        const { data } = supabase.storage
          .from("Imagenes")
          .getPublicUrl(fileName);
        
        fotoPortadaUrl = data.publicUrl;
      }

      const { error } = await supabase
        .from("registro")
        .update({
          user: formData.user,
          bio: formData.bio,
          numero: formData.numero,
          foto_perfil: fotoPerfilUrl,
          foto_portada: fotoPortadaUrl
        })
        .eq("id", userData.id);

      if (error) {
        alert("Error al actualizar perfil");
        console.error(error);
        setLoading(false);
        return;
      }
      const updatedUser = {
        ...userData,
        user: formData.user,
        bio: formData.bio,
        numero: formData.numero,
        foto_perfil: fotoPerfilUrl,
        foto_portada: fotoPortadaUrl
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      alert("Perfil actualizado");
      onUpdate(updatedUser);
      onClose();
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Error al actualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='modal-overlay'>
      <div className='modal-editar'>
        <div className='modal-header'>
          <h2>Editar Perfil</h2>
          <button onClick={onClose} className='btn-cerrar'>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className='form-group'>
            <label>Nombre de usuario</label>
            <input
              type="text"
              name="user"
              value={formData.user}
              onChange={handleChange}
              className='input-editar'
              required
            />
          </div>

          <div className='form-group'>
            <label>Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className='textarea-editar'
              placeholder="Cuéntanos sobre ti..."
              maxLength={160}
              rows={3}
            />
            <small>{formData.bio.length}/160 caracteres</small>
          </div>

          <div className='form-group'>
            <label>Número de teléfono</label>
            <input
              type="text"
              name="numero"
              value={formData.numero}
              onChange={handleChange}
              className='input-editar'
              placeholder="+57"
            />
          </div>

          <div className='form-group'>
            <label>Foto de perfil</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFotoPerfilFile(e.target.files[0])}
            />
          </div>

          <div className='form-group'>
            <label>Foto de portada</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFotoPortadaFile(e.target.files[0])}
            />
          </div>

          <div className='modal-footer'>
            <button type="button" onClick={onClose} className='btn-cancelar'>
              Cancelar
            </button>
            <button type="submit" className='btn-guardar' disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditarPerfil;