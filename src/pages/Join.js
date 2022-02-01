import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

function Join() {
  const [code, setCode] = useState();
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const codesDoc = await getDoc(doc(db, "game_room_codes", "code_array"));
    if (codesDoc.data().codes.indexOf(code) !== -1) {
      navigate(`/game/${code}`);
    } else {
      setError("please enter a valid code");
    }
  }

  function handleChange(e) {
    setCode(e.target.value.toUpperCase());
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="code"
          maxLength={6}
          placeholder="room code"
          onChange={handleChange}
          className="w-full px-2 py-4 mb-8 text-lg border-2 border-black rounded-md"
        />
        <button type="submit" className="w-full btn-primary">
          Join Game →
        </button>
        <p className="italic text-red-500"> {error}</p>
      </form>
    </div>
  );
}

export default Join;
