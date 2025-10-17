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
      {!shouldHideMenu && isLoggedIn && <Menu />}

      <div className="main-content">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/tendencia" element={<Tendencia />} />
          <Route
            path="/home"
            element={
              <AuthChecker>
                <Post />
              </AuthChecker>
            }
          />
          <Route path="/perfil/:userId" element={<PerfilPublico />} />
          <Route
            path="/perfil"
            element={
              <AuthChecker>
                <Perfil />
              </AuthChecker>
            }
          />
          <Route
            path="/notificaciones"
            element={
              <AuthChecker>
                <Notificaciones
                  notifications={[]} // temporal
                  onMarkAsRead={() => {}}
                  onClearAll={() => {}}
                  marcarTodasComoLeidas={() => {}}
                />
              </AuthChecker>
            }
          />
        </Routes>
      </div>
    </>
  );
}
