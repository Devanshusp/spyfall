import React from "react";
import { Link } from "react-router-dom";

function Error() {
  return (
    <div className="text-lg ">
      Yikes! Looks like you have stumbled upon the wall of non-existance! ...or
      perhaps just a finished game.
      <Link to="/">
        <p className="mt-2 text-base italic underline">go to home</p>
      </Link>
    </div>
  );
}

export default Error;
