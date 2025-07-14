import React from "react";
import Navbar from "./components/navbar";
import {
    BrowserRouter as Router,
    Routes,
    Route,
} from "react-router-dom";
import Home from "./pages";
import About from "./pages/about";
import './App.css';
import MarinersStats from "./pages/mariners_stats";

function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route exact path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/mariners_stats" element={<MarinersStats />} />
            </Routes>
        </Router>
    );
}

export default App;
