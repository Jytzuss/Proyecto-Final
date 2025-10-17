import React, { useEffect, useState } from "react";
import "./Tendencia.css";

function Tendencia() {
  const [noticias, setNoticias] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);
  const [modoBusqueda, setModoBusqueda] = useState(false);

  const apiKeys = [
    import.meta.env.VITE_THENEWS_API_KEY_1,
    import.meta.env.VITE_THENEWS_API_KEY_2,
    import.meta.env.VITE_THENEWS_API_KEY_3,
    import.meta.env.VITE_THENEWS_API_KEY_4,
  ].filter(Boolean);

  const [apiIndex, setApiIndex] = useState(0);

  const fetchConRotacion = async (url) => {
    for (let i = 0; i < apiKeys.length; i++) {
      const apiKey = apiKeys[(apiIndex + i) % apiKeys.length];
      if (!apiKey) continue;

      const finalUrl = `${url}&api_token=${apiKey}`;

      try {
        const res = await fetch(finalUrl);
        if (!res.ok) continue;

        const data = await res.json();
        if (!data?.data) continue;

        setApiIndex((apiIndex + i) % apiKeys.length);
        return data;
      } catch {
        continue;
      }
    }
    return { data: [] };
  };

  const cargarNoticias = async () => {
    const url = `https://api.thenewsapi.com/v1/news/top?locale=es-CO&limit=5`;
    const data = await fetchConRotacion(url);
    setNoticias(data.data || []);
  };

  const buscarNoticias = async (e) => {
    e.preventDefault();
    if (!busqueda.trim()) return;
    setCargando(true);
    setModoBusqueda(true);

    const url = `https://api.thenewsapi.com/v1/news/all?locale=es-CO&limit=6&search=${encodeURIComponent(busqueda)}`;

    const data = await fetchConRotacion(url);
    setNoticias(data.data || []);
    setCargando(false);
  };

  const volverATendencias = () => {
    setBusqueda("");
    setModoBusqueda(false);
    cargarNoticias();
  };

  useEffect(() => {
    cargarNoticias();
  }, []);

  console.log("API Keys cargadas:", apiKeys);

  return (
    <div className="container-tendencia">
      <div>
        <form onSubmit={buscarNoticias}>
          <div>
            <input
              type="search"
              placeholder="Noticias, Fútbol, Moda, Farándula, País..."
              className="buscarnoticias"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </form>
        <br />
        <button onClick={volverATendencias}>Ver tendencias</button>
        <br /> <br />
      </div>

      <div className="cuadro-premium">
        <h3><b>Subscribe to premium</b></h3>
        <p>Suscríbete para desbloquear nuevas funciones y,<br />si eres elegible, recibe una parte de los ingresos.</p>
        <button className="btn-premium">Subscribe</button>
      </div>
      <br />

      <div className="cuadro-tendencia">
        <h3>{modoBusqueda ? "Resultados de búsqueda" : "Tendencias de Hoy"}</h3>
        {noticias.length === 0 && <p>Cargando noticias...</p>}
        {noticias.map((n, i) => (
          <div key={i} className="tendencia-item">
            <a
              href={n.url}
              target="_blank"
              rel="noopener noreferrer"
              className="titulo"
            >
              {n.title}
            </a>
            <p className="fuente">{n.source}</p>
            <p className="hora">
              {new Date(n.published_at).toLocaleTimeString("es-CO", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              · {new Date(n.published_at).toLocaleDateString("es-CO")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Tendencia;
