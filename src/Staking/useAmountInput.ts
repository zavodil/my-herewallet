import { useEffect, useRef, useState } from "react";

export const formatNumber = (num: string) => {
  var useDelimeter = false;
  var right = "";
  var left = "";

  let chars = num.split("");
  chars.forEach((char) => {
    const isNumber = char >= "0" && char <= "9";
    if (isNumber && useDelimeter) right += char;
    else if (isNumber && !useDelimeter) left += char;
    else if (char === "." || char === "," || char === ",") {
      if (left == "") left = "0";
      useDelimeter = true;
    }
  });

  return useDelimeter ? `${+left}.${right}` : `${+left}`;
};

export const useAmountInput = ({ size = 32, maxWidth = 180 }) => {
  const [value, setValue] = useState("0");
  const inputRef = useRef<HTMLInputElement>(null);
  const actualSize = useRef(size);
  const num = useRef(0);

  const [span] = useState(() => {
    const span = document.createElement("span");
    span.style.fontFamily = "CabinetGrotesk";
    span.style.fontSize = size + "px";
    span.style.fontWeight = "900";
    span.style.visibility = "hidden";
    span.style.position = "absolute";
    span.style.top = "0";
    document.body.appendChild(span);
    return span;
  });

  const handleChange = (text: string | number, prefixer: (t: string) => string) => {
    if (inputRef.current == null) return;
    const value = formatNumber(text.toString());

    span.innerText = prefixer(value);
    span.style.fontSize = size + "px";

    let newSize = size;
    while (span.offsetWidth > maxWidth) {
      newSize -= 1;
      span.style.fontSize = newSize + "px";
    }

    inputRef.current.style.width = span.offsetWidth + 8 + "px";
    inputRef.current.style.fontSize = newSize + "px";
    inputRef.current.style.lineHeight = newSize + "px";
    inputRef.current.focus();
    actualSize.current = newSize;
    num.current = +value;
    setValue(prefixer(value));
  };

  return {
    inputRef,
    value,
    handleChange,
    fontSize: actualSize.current,
    numValue: num.current,
  };
};
