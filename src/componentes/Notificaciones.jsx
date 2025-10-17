import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Notificaciones.css';

function Notificaciones({ notifications, onMarkAsRead, onClearAll, marcarTodasComoLeidas }) {
  const navigate = useNavigate();

  const handleNotificationClick = (notif) => {
    onMarkAsRead(notif.id);
    
    // Redirigir según el tipo de notificación
    if (notif.post_id) {
      navigate(`/post/${notif.post_id}`);
    }
  };

  const getNotificationIcon = (tipo) => {
    switch(tipo) {
      case 'like':
        return '<img src="/heart.svg" alt="" />';
      case 'comentario':
        return '<img src="/chat.svg" alt="" />';
      case 'seguidor':
        return '<img src="/person.svg" alt="" />';
      default:
        return '<img src="/bell.svg" alt="" />';
    }
  };

  const getNotificationTitle = (tipo) => {
    switch(tipo) {
      case 'like':
        return 'Me gustó tu post';
      case 'comentario':
        return 'Nuevo comentario';
      case 'seguidor':
        return 'Nuevo seguidor';
      default:
        return 'Notificación';
    }
  };

  return (
    <div className='notificaciones-page'>
      <div className='notificaciones-header'>
        <h2>Notificaciones</h2>
        <div className='header-actions'>
          {notifications && notifications.some(n => !n.leida) && (
            <button 
              className='mark-all-read-btn'
              onClick={marcarTodasComoLeidas}
            >
              Marcar todas como leídas
            </button>
          )}
          {notifications && notifications.length > 0 && (
            <button 
              className='clear-all-btn'
              onClick={onClearAll}
            >
              Limpiar todo
            </button>
          )}
        </div>
      </div>

      {!notifications || notifications.length === 0 ? (
        <div className='no-notifications'>
          <p>📭 No tienes notificaciones</p>
        </div>
      ) : (
        <div className='notificaciones-lista'>
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`notification-item ${notif.leida ? 'read' : 'unread'}`}
              onClick={() => handleNotificationClick(notif)}
            >
              <div className='notification-avatar'>
                <img 
                  src={notif.remitente?.foto_perfil || '/user.svg'}
                  alt={notif.remitente?.user}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/perfil/${notif.remitente_id}`);
                  }}
                />
              </div>

              <div className='notification-content'>
                <div className='notification-header'>
                  <span className='notification-icon'>
                    {getNotificationIcon(notif.tipo)}
                  </span>
                  <span className='notification-title'>
                    {getNotificationTitle(notif.tipo)}
                  </span>
                </div>
                <p className='notification-message'>
                  <strong>{notif.remitente?.user}</strong> {notif.mensaje}
                </p>
                <small className='notification-date'>
                  {new Date(notif.created_at).toLocaleString('es-CO', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </small>
              </div>

              {!notif.leida && (
                <div className='unread-indicator'></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notificaciones;