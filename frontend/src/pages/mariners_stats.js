import React from "react";
import { useState, useEffect } from "react";
import * as d3 from "d3";
import axios from "axios";
import ParallelCoords from "../components/plots/parallelCoords/parallel_coords";

const MarinersStats = () => {
    const [loading, setLoading] = useState(true);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h1>
                Visualizing Hitting Stats of the 2025 Seattle Mariners Hitting Lineup
            </h1>
            <ParallelCoords />
        </div>
    );
};

export default MarinersStats;