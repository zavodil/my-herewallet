import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

export const colors = {
  elevation0: "#F3EBEA",
  elevation1: "rgb(235, 222, 220)",
  blackPrimary: "#2c3034",
  blackSecondary: "#6B6661",
  green: "#087164",
  red: "#D63E3E",
  orange: "#FDBF1E",
  pink: "rgba(253, 132, 227, 1)",
  yellow: "#FCE823",
  white: "#fff",
};

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
      maxWidth: "100%",
      width: "fit-content",
      margin: "0 16px",
    },
  }).showToast();
};
