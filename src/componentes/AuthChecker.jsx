import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from "../supabaseClient";


function AuthChecker({ children }) {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const localUser = localStorage.getItem("user");
      
      if (localUser) {
        setIsChecking(false);
        return;
      }


      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        console.log("No hay sesión activa");
        navigate("/");
        return;
      }

      console.log("Sesión de Google, guardando...");


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
        console.error("Error al guardar:", upsertError);
        navigate("/");
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

      console.log("Usuario de Google guardado");
      setIsChecking(false);
    };

    checkAuth();
  }, [navigate]);

  if (isChecking) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <p>Cargando...</p>
      </div>
    );
  }

  return children;
}

export default AuthChecker;