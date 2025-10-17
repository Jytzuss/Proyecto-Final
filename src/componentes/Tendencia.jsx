import React, { useEffect, useState } from "react";
import "./Tendencia.css";

function Tendencia() {
  const [noticias, setNoticias] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);


  const apiKeys = [
    import.meta.env.VITE_THENEWS_API_KEY,
    import.meta.env.VITE_THENEWS_API_KEY_2,
    import.meta.env.VITE_THENEWS_API_KEY_3,
    import.meta.env.VITE_THENEWS_API_KEY_4,
  ].filter(Boolean);


  const [currentKeyIndex, setCurrentKeyIndex] = useState(0);

  const getApiKey = () => apiKeys[currentKeyIndex] || apiKeys[0];


  const rotateApiKey = () => {
    setCurrentKeyIndex((prevIndex) => (prevIndex + 1) % apiKeys.length);
    console.warn(` Cambiando a la siguiente API key...`);
  };


  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


  const cargarNoticias = async (retryCount = 0) => {
    try {
      const url = `https://api.thenewsapi.com/v1/news/top?limit=5&locale=es-CO&api_token=${getApiKey()}`;
      const res = await fetch(url);
      const data = await res.json();


      if ((res.status === 402 || res.status === 429) && retryCount < apiKeys.length) {
        console.log(` Key ${currentKeyIndex + 1} falló (${res.status}).`);
        rotateApiKey();
        await delay(1200);
        return cargarNoticias(retryCount + 1);
      }

      setNoticias(data.data || []);
    } catch (error) {
      console.error("Error al cargar noticias:", error);
    }
  };


  const buscarNoticias = async (e, retryCount = 0) => {
    e.preventDefault();
    if (!busqueda.trim()) return;
    setCargando(true);

    try {
      const url = `https://api.thenewsapi.com/v1/news/all?search=${encodeURIComponent(
        busqueda
      )}&locale=es-CO&limit=6&api_token=${getApiKey()}`;
      const res = await fetch(url);
      const data = await res.json();

      if ((res.status === 402 || res.status === 429) && retryCount < apiKeys.length) {
        console.log(` Key ${currentKeyIndex + 1} falló en búsqueda.`);
        rotateApiKey();
        await delay(1200);
        setCargando(false);
        return buscarNoticias(e, retryCount + 1);
      }

      setNoticias(data.data || []);
    } catch (error) {
      console.error("Error al buscar noticias:", error);
    } finally {
      setCargando(false);
    }
  };

 
  useEffect(() => {
    cargarNoticias();
  }, [currentKeyIndex]);

  return (
    <div className="container-tendencia">
      <div>
        <form onSubmit={buscarNoticias}>
          <input
            type="search"
            placeholder="Noticias, Fútbol, Moda, Farándula, País..."
            className="buscarnoticias"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </form>
        <br />
        <button onClick={cargarNoticias}>Ver tendencias</button>
        <br /> <br />
      </div>

      <div className="cuadro-premium">
        <h3><b>Subscribe to premium</b></h3>
        <p>
          Suscríbete para desbloquear nuevas funciones y,<br />
          si eres elegible, recibe una parte de los ingresos.
        </p>
        <button className="btn-premium">Subscribe</button>
      </div>
      <br />

      <div className="cuadro-tendencia">
        <h3>Tendencias de Hoy</h3>
        {cargando ? (
          <p>Cargando noticias...</p>
        ) : noticias.length === 0 ? (
          <p>No hay noticias disponibles</p>
        ) : (
          noticias.map((n, i) => (
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
          ))
        )}
      </div>
    </div>
  );
}

export default Tendencia;
