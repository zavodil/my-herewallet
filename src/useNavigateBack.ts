import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const useNavigateBack = (url: any = -1) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!window.Telegram?.WebApp?.BackButton) return;
    const handler = () => navigate(url, { replace: true });
    window.Telegram.WebApp.BackButton.onClick(handler);
    window.Telegram.WebApp.BackButton.show();
    return () => {
      window.Telegram.WebApp.BackButton.offClick(handler);
      window.Telegram.WebApp.BackButton.hide();
    };
  }, []);
};
