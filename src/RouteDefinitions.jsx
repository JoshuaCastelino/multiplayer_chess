import React from "react";
import { Routes, Route } from "react-router-dom";
import ModeSelection from "./ModeSelection"; 
import LobbyPage from "./LobbyPage"
import App from "./App";

function RouteDefinitions() {
    return (
        <Routes>
            <Route path="/" element={<ModeSelection />} /> 
            <Route path="/connectToLobby" element={<LobbyPage/>} />       
            <Route path="/passAndPlay" element={<App preventFlipping={true} debug={false}/>} />       
            <Route path="/debug" element={<App preventFlipping={false} debug={true}/>} />   
            <Route path="/singlePlayer" element={<App preventFlipping={false} debug={false}/>} />   
            <Route path="/multiplayer" element={<App preventFlipping={false} debug={false}/>} />   
        </Routes>
    );
}

export default RouteDefinitions;
