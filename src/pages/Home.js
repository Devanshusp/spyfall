import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Home() {
  let navigate = useNavigate();
  function hostGame() {
    navigate("/settings");
  }

  function joinGame() {
    navigate("/join");
  }

  return (
    <div className="flex flex-col w-full">
      <button onClick={hostGame} className="mb-8 btn-primary">
        Host game +
      </button>
      <div className="flex flex-col">
        <button onClick={joinGame} className="btn-primary">
          Join game →
        </button>
        <Link to="/instructions">
          <p className="italic underline">how to play</p>
        </Link>
      </div>
    </div>
  );
}

export default Home;
