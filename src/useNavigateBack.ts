import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const lockScroll = () => {
  document.body.classList.add("scroll-locked");
};

export const unlockScroll = () => {
  document.body.classList.remove("scroll-locked");
};

export const useScrollLock = () => {
  useEffect(() => {
    lockScroll();
    return () => unlockScroll();
  }, []);
};

export const useNavigateBack = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!window.Telegram?.WebApp?.BackButton) return;
    const handler = () => navigate(-1);
    window.Telegram.WebApp.BackButton.onClick(handler);
    window.Telegram.WebApp.BackButton.show();
    return () => {
      window.Telegram.WebApp.BackButton.offClick(handler);
      window.Telegram.WebApp.BackButton.hide();
    };
  }, []);
};
