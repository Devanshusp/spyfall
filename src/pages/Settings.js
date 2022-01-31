import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { setDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { getUserId } from "../functions/UserID";

function Settings(props) {
  // variables
  const initialValues = { username: "", spy_count: "" };
  const [formValues, setFormValues] = useState(initialValues);
  const [minPlayers, setMinPlayers] = useState(3);
  const [errorMessage, setErrorMessage] = useState("");
  const uuid = getUserId();
  const navigate = useNavigate();

  useEffect(() => {
    props.setGame_id(getSixLetterCode());
  }, []);

  function getSixLetterCode() {
    let code = "";
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    while (code.length < 6) {
      code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return code;
  }

  // handling form
  function handleSubmit(e) {
    updateErrorMessage();
    e.preventDefault();
    if (formValues.username && formValues.spy_count) {
      startGame();
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  }

  useEffect(() => {
    if (parseInt(formValues.spy_count) > 1) {
      setMinPlayers(5);
    } else {
      setMinPlayers(3);
    }
  }, [formValues.spy_count]);

  // handling errors
  function updateErrorMessage() {
    let error = "";
    if (!formValues.username && !formValues.spy_count) {
      error = "choose your settings";
    } else if (!formValues.username) {
      error = "enter your name";
    } else if (!formValues.spy_count) {
      error = "pick the number of spies";
    }
    setErrorMessage(error);
  }

  useEffect(() => {
    if (errorMessage) {
      updateErrorMessage();
    }
  }, [formValues]);

  // starting game
  async function startGame() {
    try {
      // update game room code list (check for duplicates)
      let codeArr = [];
      const codesDoc = await getDoc(doc(db, "game_room_codes", "code_array"));
      if (codesDoc.exists()) {
        codesDoc.data().codes.forEach((element) => {
          codeArr.push(element);
        });
        while (codeArr.indexOf(props.game_id) !== -1) {
          props.setGame_id(getSixLetterCode());
        }
        codeArr.push(props.game_id);
        await updateDoc(doc(db, "game_room_codes/code_array"), {
          codes: codeArr,
        });
      } else {
        codeArr.push(props.game_id);
        await setDoc(doc(db, "game_room_codes/code_array"), {
          codes: codeArr,
        });
      }

      // add game room
      await setDoc(doc(db, `game_rooms/${props.game_id}`), {
        host_uid: uuid,
        spy_count: formValues.spy_count,
        min_player_count: minPlayers,
        player_data_arr: [{ username: formValues.username, uid: uuid }],
        banned_player_uid: [],
        game_room_closed: false,
        spy_uid: [],
        location: "",
        location_roles: [],
        ongoing_game: false,
        midgame_player_uid: [],
      });

      // navigate to new game page
      navigate(`/game/${props.game_id}`);
    } catch (e) {
      console.error("Error adding document: ", e);
      setErrorMessage("please try again later");
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          maxLength={15}
          placeholder="username"
          onChange={handleChange}
          className="w-full px-2 py-4 mb-8 text-lg border-2 border-black rounded-md"
        />
        <div className="flex flex-row w-full mb-8">
          <label className="flex flex-row items-center justify-center w-full mr-1 text-center btn-primary">
            <input
              type="radio"
              name="spy_count"
              value="1"
              id="1"
              onChange={handleChange}
              className="w-4 h-4"
            />
            🕵️ Spy
          </label>
          <label className="flex flex-row items-center justify-center w-full ml-1 text-center btn-primary">
            <input
              type="radio"
              name="spy_count"
              value="2"
              id="2"
              onChange={handleChange}
              className="w-4 h-4"
            />
            🕵️🕵️ Spies
          </label>
        </div>
        <button type="submit" className="w-full btn-primary">
          Create Game ✓
        </button>
        {errorMessage && (
          <label className="italic text-red-500">{errorMessage}</label>
        )}
        {!errorMessage && formValues.spy_count && (
          <label className="italic">
            you need a minimum of {minPlayers} players to play
          </label>
        )}
      </form>
    </div>
  );
}

export default Settings;
