import React, { useEffect, useState } from "react";
import "./Tendencia.css";

function Tendencia() {
  const [noticias, setNoticias] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);

  const apiKey = import.meta.env.VITE_THENEWS_API_KEY;

  const cargarNoticias = async () => {
    const url = `https://api.thenewsapi.com/v1/news/top?locale=es&limit=5&api_token=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    setNoticias(data.data || []);
  };

  const buscarNoticias = async (e) => {
    e.preventDefault();
    if (!busqueda.trim()) return;
    setCargando(true);
    const url = `https://api.thenewsapi.com/v1/news/all?search=${encodeURIComponent(
      busqueda
    )}&locale=es-CO&limit=6&api_token=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    setNoticias(data.data || []);
    setCargando(false);
  };

  useEffect(() => {
    cargarNoticias();
  }, []);

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
        <button onClick={cargarNoticias}>Ver tendencias</button>
        <br /> <br />
      </div>

      <div className="cuadro-premium">
        <h3><b>Subscribe to premium</b></h3>
        <p>Suscríbete para desbloquear nuevas funciones y,<br />si eres elegible, recibe una parte de los ingresos.</p>
        <button className="btn-premium">Subscribe</button>
      </div>
      <br />

      <div className="cuadro-tendencia">
        <h3>Tendencias de Hoy</h3>
        {noticias.length === 0 && <p>Cargando noticias...</p>}
        {noticias.map((n, i) => (
          <div key={i} className="tendencia-item">
            <a href={n.url} target="_blank" rel="noopener noreferrer" className="titulo">
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
