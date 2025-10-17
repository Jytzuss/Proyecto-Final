import React, { useState, useEffect } from "react";
import supabase from "../supabaseClient";
import "./Likes.css";

function Likes({ postId, userId, likes, onLikeChange }) {
  const [hasLiked, setHasLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes?.length || 0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (likes && userId) {
      const userLiked = likes.some(like => like.user_id === userId);
      setHasLiked(userLiked);
    }
    setLikeCount(likes?.length || 0);
  }, [likes, userId]);

  const handleLike = async () => {
    if (!userId) {
      alert("Debes estar logueado");
      return;
    }

    setLoading(true);

    try {
      if (hasLiked) {
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", userId);

        if (error) throw error;

        setHasLiked(false);
        setLikeCount(likeCount - 1);
      } else {
        const { error } = await supabase
          .from("likes")
          .insert([{
            post_id: postId,
            user_id: userId
          }]);

        if (error) throw error;

        setHasLiked(true);
        setLikeCount(likeCount + 1);
      }

      const { data: newLikes } = await supabase
        .from("likes")
        .select("id, user_id")
        .eq("post_id", postId);

      onLikeChange(newLikes || []);
    } catch (error) {
      console.error("Error al dar like:", error);
      alert("Error al procesar el like");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`like-btn ${hasLiked ? "liked" : ""}`}
      onClick={handleLike}
      disabled={loading}
      title={hasLiked ? "Quitar like" : "Dar like"}
    >
      <img
        src={hasLiked ? "/heartfill.svg" : "/heart.svg"}
        alt="Like"
        width={18}
      />
      <span className="like-count">{likeCount}</span>
    </button>
  );
}

export default Likes;