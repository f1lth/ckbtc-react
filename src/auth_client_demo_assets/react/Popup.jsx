import React from "react";
import { useAuth } from "./use-auth-client";

function Popup({header_text, body_text}) {

  const { login } = useAuth();

  return (
    <div className="popup">
      <h1></h1>
      <h2>{header_text}</h2>
      <p>{body_text}</p>
    </div>
  );
}

export default Popup;
