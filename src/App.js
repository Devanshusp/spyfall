import { useState } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import Header from "./pages/Header";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import Game from "./pages/Game";
import Error from "./pages/Error";
import Join from "./pages/Join";
import Instructions from "./pages/Instructions";

function App() {
  const [game_id, setGame_id] = useState("");

  return (
    <HashRouter>
      <div className="flex flex-col items-center w-screen h-screen max-w-xl m-auto font-mono bg-white App border-x min-w-[275px]">
        <Header />
        <div className="flex flex-col items-center w-full h-full px-5 py-10 overflow-auto sm:p-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/instructions" element={<Instructions />} />
            <Route
              path="/settings"
              element={<Settings game_id={game_id} setGame_id={setGame_id} />}
            />
            <Route path="/join" element={<Join />} />
            <Route path="/game/:id" element={<Game />} />
            <Route path="*" element={<Error />} />
          </Routes>
        </div>
      </div>
    </HashRouter>
  );
}

export default App;
