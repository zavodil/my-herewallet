import { useEffect } from "react";
import { H1 } from "../uikit";

const InvalidTransaction = () => {
  useEffect(() => {
    window.location.href = "https://herewallet.app";
  }, []);

  return <H1>Redirecting...</H1>;
};

export default InvalidTransaction;
