import React from "react";
import { Routes, Route } from "react-router-dom";
import ModeSelection from "./ModeSelection"; 
import App from "./App";

function RouteDefinitions() {
    return (
        <Routes>
            <Route path="/" element={<ModeSelection />} /> 
            <Route path="/singlePlayer" element={<App preventFlipping={false}/>} />   
            <Route path="/multiPlayer" element={<App preventFlipping={false}/>} />       
            <Route path="/passAndPlay" element={<App preventFlipping={true}/>} />       
    
        </Routes>
    );
}

export default RouteDefinitions;
