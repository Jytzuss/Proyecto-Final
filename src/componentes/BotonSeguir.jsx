import React, { useState, useEffect } from "react";
import supabase from "../supabaseClient";
import "./BotonSeguir.css";

function BotonSeguir({ userId, currentUserId, onFollowChange }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkIfFollowing();
  }, [userId, currentUserId]);

  const checkIfFollowing = async () => {
    if (!currentUserId || userId === currentUserId) return;

    const { data } = await supabase
      .from("seguidores")
      .select("id")
      .eq("seguidor_id", currentUserId)
      .eq("seguido_id", userId)
      .maybeSingle();

    setIsFollowing(!!data);
  };

  const handleFollow = async () => {
    if (!currentUserId || userId === currentUserId) return;

    setLoading(true);

    try {
      if (isFollowing) {
        const { error } = await supabase
          .from("seguidores")
          .delete()
          .eq("seguidor_id", currentUserId)
          .eq("seguido_id", userId);

        if (error) throw error;
        setIsFollowing(false);
      } else {
        const { error } = await supabase
          .from("seguidores")
          .insert([{
            seguidor_id: currentUserId,
            seguido_id: userId
          }]);

        if (error) throw error;
        setIsFollowing(true);
      }

      onFollowChange?.();
    } catch (error) {
      console.error("Error:", error);
      alert("Error al procesar seguimiento");
    } finally {
      setLoading(false);
    }
  };

  if (userId === currentUserId) return null;

  return (
    <button
      className={`follow-btn ${isFollowing ? "following" : ""}`}
      onClick={handleFollow}
      disabled={loading}
    >
      {isFollowing ? "Siguiendo" : "Seguir"}
    </button>
  );
}

export default BotonSeguir;