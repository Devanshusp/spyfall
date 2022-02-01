import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import copy from "copy-to-clipboard";
import {
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { getUserId } from "../functions/UserID";
import ConfirmModal from "./ConfirmModal";
import { getLocationData } from "../functions/GameFunctions";
import { locationMap } from "../functions/Locations";

function Game(props) {
  // variables
  let { id } = useParams();
  id = id.toUpperCase();
  const [gameData, setGameData] = useState();
  const [dataLoaded, setDataLoaded] = useState(false);
  const [userName, setUserName] = useState();
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [isHost, setIsHost] = useState();
  const [kickIndex, setKickIndex] = useState();
  const [banned, setBanned] = useState(false);
  const [totalPlayersNeeded, setTotalPlayersNeeded] = useState();
  const [confirmAction, setConfirmAction] = useState();
  const [ongoingGame, setOngoingGame] = useState(false);
  const [isMidGamePlayer, setIsMidGamePlayer] = useState(false);
  let checkedArr = [];
  const uuid = getUserId();
  const navigate = useNavigate();

  // setting up initial game data
  useEffect(() => {
    checkIfGameExists();
    const unsubscribe = onSnapshot(doc(db, "game_rooms", id), (doc) => {
      setGameData(doc.data());
      setDataLoaded(true);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (dataLoaded) {
      leaveIfGameDeleted();
      checkIfUserExists();
      checkIfBanned();
      getNumPlayersNeeded();
      checkGameStatus();
      checkIfMidGamePlayer();
      if (gameData.host_uid === uuid) {
        setIsHost(true);
      }
    }
  }, [dataLoaded, gameData]);

  function getNumPlayersNeeded() {
    setTotalPlayersNeeded(
      parseInt(gameData.min_player_count) - gameData.player_data_arr.length
    );
  }

  // checking for errors
  async function checkIfGameExists() {
    const docSnap = await getDoc(doc(db, "game_rooms", id));
    if (!docSnap.exists()) {
      navigate("/error");
    }
  }

  // adding players
  function checkIfUserExists() {
    let userExists = false;
    gameData.player_data_arr.forEach((element) => {
      if (uuid === element.uid) {
        userExists = true;
      }
    });
    if (!userExists) {
      setShowJoinForm(true);
    }
  }

  async function addUser(e) {
    e.preventDefault();
    setShowJoinForm(false);
    await updateDoc(doc(db, "game_rooms", id), {
      player_data_arr: arrayUnion({ username: userName, uid: uuid }),
    });
    if (ongoingGame) {
      await updateDoc(doc(db, "game_rooms", id), {
        midgame_player_uid: arrayUnion(uuid),
      });
    }
  }

  function handleChange(e) {
    setUserName(e.target.value);
  }

  // removing players
  async function leaveGame() {
    let username = "";
    gameData.player_data_arr.map((arr) => {
      if (arr.uid === uuid) {
        username = arr.username;
      }
    });
    await updateDoc(doc(db, "game_rooms", id), {
      player_data_arr: arrayRemove({
        username: username,
        uid: uuid,
      }),
    });
    navigate("/");
  }

  async function kickPlayer(index) {
    const username = gameData.player_data_arr[index].username;
    const uid = gameData.player_data_arr[index].uid;
    await updateDoc(doc(db, "game_rooms", id), {
      banned_player_uid: arrayUnion(uid),
      player_data_arr: arrayRemove({
        username: username,
        uid: uid,
      }),
    });
  }

  function checkIfBanned() {
    if (gameData.banned_player_uid.indexOf(uuid) !== -1) {
      setBanned(true);
      setShowJoinForm(false);
    }
  }

  // deleting room
  async function deleteRoom() {
    await updateDoc(doc(db, "game_rooms", id), {
      game_room_closed: true,
    });
    await deleteDoc(doc(db, "game_rooms", id));
    await updateDoc(doc(db, "game_room_codes", "code_array"), {
      codes: arrayRemove(id),
    });
  }

  function leaveIfGameDeleted() {
    if (gameData.game_room_closed) {
      navigate("/");
    }
  }

  // start game
  async function startGame() {
    if (
      !ongoingGame &&
      gameData.player_data_arr.length >= gameData.min_player_count
    ) {
      let randomUid = [];
      const spyOne = Math.floor(
        Math.random() * gameData.player_data_arr.length
      );
      randomUid.push(gameData.player_data_arr[spyOne].uid);
      if (parseInt(gameData.spy_count) === 2) {
        let spyTwo = Math.floor(
          Math.random() * gameData.player_data_arr.length
        );
        while (gameData.player_data_arr.length > 1 && spyOne === spyTwo) {
          spyTwo = Math.floor(Math.random() * gameData.player_data_arr.length);
        }
        randomUid.push(gameData.player_data_arr[spyTwo].uid);
      }

      const locationData = getLocationData();
      await updateDoc(doc(db, "game_rooms", id), {
        spy_uid: randomUid,
        location: locationData[0],
        location_roles: locationData[1],
        ongoing_game: true,
      });
      setOngoingGame(true);
    }
  }

  function checkGameStatus() {
    if (gameData.ongoing_game) {
      setOngoingGame(true);
    } else {
      setOngoingGame(false);
    }
  }

  // restart game
  async function resetGame() {
    await updateDoc(doc(db, "game_rooms", id), {
      spy_uid: [],
      location: "",
      location_roles: [],
      ongoing_game: false,
      midgame_player_uid: [],
    });
    checkIfMidGamePlayer();
    setOngoingGame(false);
    showJoinForm(false);
    checkedArr = [];
  }

  function checkIfMidGamePlayer() {
    if (gameData.midgame_player_uid.indexOf(uuid) !== -1) {
      setIsMidGamePlayer(true);
    } else {
      setIsMidGamePlayer(false);
    }
  }

  // components
  function CopyCode(props) {
    function copyLinkToClipboard() {
      copy(document.URL);
    }
    return (
      <div className="flex flex-col items-center">
        <div className="flex flex-row items-center text-xl uppercase sm:text-2xl">
          Room code:
          <div
            onClick={copyLinkToClipboard}
            onTouchStart={copyLinkToClipboard}
            className="font-extrabold underline text-primary hover:cursor-pointer hover:text-secondary hover:font-black"
          >
            {props.id}
          </div>
        </div>
        <div className="text-sm italic">(click to copy link)</div>
      </div>
    );
  }

  function Banned() {
    return (
      <div className="mt-4 text-center text-red-500">
        Looks like the owner of this room has banned you 🤔
      </div>
    );
  }

  function NameChart() {
    return (
      <div>
        <div className="mt-6 mb-2 border rounded-md shadow-sm">
          <div className="h-12 py-2 text-2xl text-center uppercase rounded-t-md bg-slate-100">
            Players
          </div>
          {gameData.player_data_arr.map((user, index) => {
            let nameStyles =
              "border-t text-center py-1 flex flex-row justify-center h-fit";
            let emoji = "👾";
            let hostTag = false;
            if (user.uid === uuid) {
              nameStyles += " bg-blue-200";
            }
            if (user.uid === gameData.host_uid) {
              emoji = "🎮";
              hostTag = true;
            }
            if (gameData.midgame_player_uid.indexOf(user.uid) !== -1) {
              emoji = "👽";
            }
            if (index === gameData.player_data_arr.length - 1) {
              nameStyles += " rounded-b-md";
            }
            return (
              <div key={index} className={nameStyles}>
                {emoji} {user.username}
                {isHost && !hostTag && !ongoingGame && (
                  <div
                    onClick={() => {
                      setKickIndex(index);
                      setConfirmAction("kick");
                    }}
                    className="relative flex items-center ml-1 text-sm text-red-500 top-1 hover:cursor-pointer hover:underline h-fit"
                  >
                    (kick)
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap text-white">
          <div className="rounded-2xl w-fit px-2 mr-2 pb-[1px] bg-secondary text-sm border-2">
            minimum players: {gameData.min_player_count}
          </div>
          <div className="border-2 rounded-2xl w-fit px-2 pb-[1px] bg-secondary text-sm">
            {parseInt(gameData.spy_count) === 1 ? "spy: " : "spies: "}
            {gameData.spy_count}
          </div>
        </div>
      </div>
    );
  }

  function GameCard() {
    const [hideRole, setHideRole] = useState(false);
    const [style, setStyle] = useState("");
    const [showLocations, setShowLocations] = useState(false);
    const [locationStyle, setLocationStyle] = useState(" h-fit");

    useEffect(() => {
      if (hideRole) {
        setStyle(" blur-xl");
      } else {
        setStyle("");
      }
    }, [hideRole]);

    useEffect(() => {
      if (showLocations) {
        setLocationStyle(" h-fit");
      } else {
        setLocationStyle(" h-8");
      }
    }, [showLocations]);

    function roleIndex() {
      for (let i = 0; i < gameData.player_data_arr.length; i++) {
        if (gameData.player_data_arr[i].uid === uuid) {
          return i % gameData.location_roles.length;
        }
      }
      return 0;
    }

    const index = roleIndex();

    function LocationList(props) {
      const [strikeStyle, setStrikeStyle] = useState("");
      const [change, setChange] = useState(false);

      useEffect(() => {
        if (checkedArr.indexOf(props.index) !== -1) {
          setStrikeStyle(" line-through");
        } else {
          setStrikeStyle("");
        }
      }, [change]);

      function changeCheckedArr() {
        if (checkedArr.indexOf(props.index) !== -1) {
          checkedArr.splice(checkedArr.indexOf(props.index), 1);
        } else {
          checkedArr.push(props.index);
        }
        setChange(!change);
      }

      return (
        <div
          onClick={changeCheckedArr}
          className={
            "py-[2px] text-sm text-center mini:text-base hover:cursor-pointer" +
            strikeStyle
          }
        >
          {props.location}
        </div>
      );
    }

    return !isMidGamePlayer && !showJoinForm ? (
      <div>
        <div className="w-full p-2 mt-8 mb-2 rounded-md shadow-sm bg-slate-200">
          <div className={"py-10 duration-200" + style}>
            {uuid === gameData.spy_uid[0] ||
            (gameData.spy_uid.length > 1 && uuid === gameData.spy_uid[1]) ? (
              <div className="text-2xl text-center uppercase">
                you are the spy!
                <br />
                good luck :)
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <div className="text-xl text-center break-words">
                  Location:{" "}
                  <span className="text-2xl uppercase">
                    {gameData.location}
                  </span>
                </div>

                <div className="text-xl text-center">
                  Role:{" "}
                  <span className="text-2xl uppercase">
                    {gameData.location_roles[index]}
                  </span>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => setHideRole(!hideRole)}
            className="w-full btn-primary"
          >
            {hideRole ? "show role" : "hide role"}
          </button>
        </div>
        <div
          className={
            "rounded-md border overflow-hidden shadow-sm " + locationStyle
          }
        >
          <button
            onClick={() => setShowLocations(!showLocations)}
            className="w-full h-8 mx-auto text-lg uppercase hover:underline bg-slate-100"
          >
            {showLocations ? "locations checklist △" : "locations checklist ▽"}
          </button>
          <div className="grid grid-cols-1 py-2 slim:grid-cols-2">
            {[...locationMap].map((locationData, index) => {
              return <LocationList location={locationData[0]} index={index} />;
            })}
          </div>
        </div>
      </div>
    ) : (
      ongoingGame && (
        <div className="pt-4 text-center">
          Please wait for the next game to begin ⏱️
        </div>
      )
    );
  }

  return (
    <div className="w-full">
      <CopyCode id={id} />
      {banned && <Banned />}
      {showJoinForm && !banned && (
        <form onSubmit={addUser}>
          <div className="flex flex-row my-8">
            <input
              type="text"
              name="username"
              maxLength={15}
              placeholder="username"
              onChange={handleChange}
              className="w-3/5 px-2 py-4 mr-1 text-lg border-2 border-black rounded-md"
            />
            <button
              type="submit"
              disabled={banned}
              className="w-2/5 h-16 ml-1 bg-green-400 hover:bg-green-500 btn-primary"
            >
              Join ↩
            </button>
          </div>
        </form>
      )}
      {gameData && <NameChart />}
      {ongoingGame && <GameCard />}
      {!isMidGamePlayer ? (
        !isHost &&
        !showJoinForm &&
        !ongoingGame && (
          <button
            onClick={() => setConfirmAction("leave")}
            className="w-full mt-8 bg-red-400 btn-primary hover:bg-red-500"
          >
            Leave ↪
          </button>
        )
      ) : (
        <button
          onClick={() => setConfirmAction("leave")}
          className="w-full mt-8 bg-red-400 btn-primary hover:bg-red-500"
        >
          Leave ↪
        </button>
      )}

      {isHost && (
        <div className="flex flex-row mt-8">
          <button
            onClick={() => setConfirmAction("delete")}
            className="w-full mr-1 bg-red-400 btn-primary hover:bg-red-500"
          >
            Delete Room ×
          </button>
          {!ongoingGame ? (
            <button
              onClick={() => startGame()}
              className="w-full ml-1 btn-primary"
            >
              Start Game →
            </button>
          ) : (
            <button
              onClick={() => resetGame()}
              className="w-full ml-1 btn-primary"
            >
              Reset Game ↬
            </button>
          )}
        </div>
      )}
      {!ongoingGame && (
        <div className="italic text-right sm:text-lg">
          {totalPlayersNeeded <= 0
            ? ""
            : `need ${totalPlayersNeeded} more
        ${totalPlayersNeeded === 1 ? "player" : "players"} to begin`}
        </div>
      )}
      {confirmAction === "delete" ? (
        <ConfirmModal
          confirmAction={deleteRoom}
          setConfirmAction={setConfirmAction}
          actionTitle={"Delete Room"}
          action={
            "Are you sure you want to delete your room? All other players will be kicked out of this room aswell."
          }
          verb={"Delete Room"}
        />
      ) : (
        <></>
      )}
      {confirmAction === "kick" ? (
        <ConfirmModal
          confirmAction={() => {
            kickPlayer(kickIndex);
            setConfirmAction();
          }}
          setConfirmAction={setConfirmAction}
          actionTitle={"Kick Player"}
          action={
            "Are you sure you want to kick this player? They will be banned from the room and unable to join again."
          }
          verb={"Kick Player"}
        />
      ) : (
        <></>
      )}
      {confirmAction === "leave" ? (
        <ConfirmModal
          confirmAction={leaveGame}
          setConfirmAction={setConfirmAction}
          actionTitle={"Leave Game"}
          action={
            "Are you sure you want to leave this game? You can join again later!"
          }
          verb={"Leave"}
        />
      ) : (
        <></>
      )}
    </div>
  );
}

export default Game;
