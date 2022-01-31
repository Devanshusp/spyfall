import React from "react";
import { Link } from "react-router-dom";

function Header() {
  return (
    <div className="z-0 flex items-center justify-center w-full p-2 border-b bg-slate-100">
      <Link to="/">
        <h1 className="text-4xl uppercase">🕵️‍♂️ Spyfall</h1>
      </Link>
    </div>
  );
}

export default Header;
