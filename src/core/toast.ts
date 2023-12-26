import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import { colors } from "../uikit/theme";

export const notify = (txt: string, ms = 2500) => {
  Toastify({
    text: txt,
    duration: ms,
    gravity: "bottom", // `top` or `bottom`
    position: "left", // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover

    style: {
      background: colors.yellow,
      border: `1px solid ${colors.blackPrimary}`,
      color: colors.blackPrimary,
      fontWeight: "600",
      borderRadius: "12px",
    },
  }).showToast();
};
