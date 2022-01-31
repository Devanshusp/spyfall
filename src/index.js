import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

const setVh = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
};
window.addEventListener("load", setVh);
window.addEventListener("resize", setVh);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
