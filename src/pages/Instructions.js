import React from "react";
import ReactPlayer from "react-player/youtube";
import PlayerImg from "../assets/Role-Player.png";
import SpyImg from "../assets/Role-Spy.png";

function Instructions() {
  return (
    <div className="w-full">
      <div className="w-full mb-4 text-xl text-center underline uppercase">
        Instructions for Spyfall:
      </div>
      <ul className="pl-6 list-disc">
        <li>
          After starting a game, each player will recieve the same location
          along with a specific role, except one or two players, who will be
          spies (without a location or role). No player shall reveal their role.
        </li>
        <div className="relative mb-4 right-3">
          <img src={PlayerImg} />
          <img src={SpyImg} />
        </div>
        <li className="mb-4">
          One player (regardless of their role) begins the round by asking
          another player a question. The other player then answers (assuming
          their role and location) that question and then proceeds to ask any
          other player a question of their own.
        </li>
        <li className="mb-4">
          All non-spies should answer their question truthfully, although the
          spy is allowed to lie.
        </li>
        <li className="mb-4">
          The spy's objective throughout the round is to listen carefully,
          answer thoughtfully, and identify the location, all without blowing
          their cover!
        </li>
        <li className="mb-4">
          The other players' object is to try and identify the spy (or spies)
          without revealing the location.
        </li>
        <li className="mb-4">
          At the end of the round (which could be determined by a timer or when
          the majority of players reach a consensus) players will vote on who
          they think the spy is. If there are 2 spies, players must perform 2
          rounds of voting.
        </li>
        <li className="mb-4">
          The spy wins if they can guess the location correctly before being
          voted out or if the players vote out a non-spy. If there are 2 spies,
          they must discuss before guessing the location at the end of the
          round.
        </li>
        <li className="mb-4">
          The players win if they vote the spy out or if the spy guesses the
          wrong location.
        </li>
      </ul>
      <div className="w-full pt-4 mt-4 border-t">
        <p className="mb-4">
          If you like learning visually, watch these guys play Spyfall!
        </p>
        <ReactPlayer
          url="https://youtu.be/_AJva1xq160"
          controls={true}
          light={true}
          width="100%"
        />
      </div>
    </div>
  );
}

export default Instructions;
