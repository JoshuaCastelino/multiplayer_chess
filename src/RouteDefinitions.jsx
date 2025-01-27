import React from "react";
import { Routes, Route } from "react-router-dom";
import ModeSelection from "./ModeSelection"; 
import App from "./App";

function RouteDefinitions() {
    return (
        <Routes>
            <Route path="/" element={<ModeSelection />} /> 
            <Route path="/app" element={<App />} />       
        </Routes>
    );
}

export default RouteDefinitions;
