import { useState, useEffect } from 'react'
import './App.css'
import Menu from './componentes/Menu';
import Login from './componentes/Login'
import { Route, Routes, useLocation } from 'react-router-dom'
import Perfil from './componentes/Perfil';
import Post from './componentes/Post';
import PerfilPublico from './componentes/PerfilPublico';
import AuthChecker from './componentes/AuthChecker';
import Tendencia from './componentes/Tendencia';
import Notificaciones from './componentes/Notificaciones';

function App() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setIsLoggedIn(!!user);
  }, [location]);

  const hideMenuRoutes = ["/", "/login", "/registro"];
  const shouldHideMenu = hideMenuRoutes.includes(location.pathname.toLowerCase());

  return (
    <>

      {!shouldHideMenu && isLoggedIn}
      <div className="main-content">
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='tendencia' element={<Tendencia />} />

          <Route
            path='/home'
            element={
              <AuthChecker>
                <Post />
              </AuthChecker>
            }
          />

          <Route
            path='/perfil/:userId'
            element={<PerfilPublico />}
          />

          <Route
            path='/perfil'
            element={
              <AuthChecker>
                <Perfil />
              </AuthChecker>
            }
          />
        </Routes>

        <Route path="/notificaciones" element={
          <AuthChecker>
            <Notificaciones
              notifications={notifications}
              onMarkAsRead={marcarComoLeida}
              onClearAll={limpiarTodas}
              marcarTodasComoLeidas={marcarTodasComoLeidas}
            />
          </AuthChecker>
        } />
      </div>

    </>
  )
}

export default App