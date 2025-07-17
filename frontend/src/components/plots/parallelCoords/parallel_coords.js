// NOT TESTED BUT FINISHED

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import axios from "axios";
import ParallelPlot from "./plot";

const ParallelCoords = () => {
    const ref = useRef();
    const [data, setData] = useState();
    const [pitcherData, setPitcherData] = useState();
    const [selectedPitcher, setSelectedPitcher] = useState("all");
    const [plotData, setPlotData] = useState([]);
    const [dimensions, setDimensions] = useState([]);
    const [loading, setLoading] = useState(true);
    // const [rawData, setRawData] = useState();
    //const [error, setError] = useState(null);

    // useEffect hook
    // when doing data fetching, want to use useEffect hook
    // with empty dependency array because that means
    // it will run only when the page first launches
    // meaning that eventually it will not be empty for dropdown menu purposes
    useEffect(() => {
        // this will get list of pitchers for the dropdown menu
        // will render once when the page first loads
        // this list must be filtered below in the frontend for just those pitchers with matching MLBID numbers
        // to those in the total outs list (default status)
        async function getPitcher() {
            const response = await axios.get("http://localhost:3000/player_ids/pitchers");
            // if request is successful, set state
            if (response.status === 200) {
                setPitcherData(response.data);
                setLoading(false);
            }
        }
        getPitcher();
    }, []);

    // this will rerun when selectedPitcher changes based on user interaction
    useEffect(() => {
        // this call gets all outs for all pitchers the mariners have faced
        async function getAllOuts() {
            const response = await axios.get("http://localhost:3000/mariners_stats/outs");
            // if request is successful, set state
            if (response.status === 200) {
                setData(response.data);
                setLoading(false);
            }
        }
        // getAllOuts();

        // need separate function for pitcher specific outs
        async function getPitcherOuts() {
            const response = await axios.get(`http://localhost:3000/mariners_stats/outs/${selectedPitcher}`);
            // if request is successful, set state
            if (response.status === 2000) {
                setData(response.data);
                setLoading(false);
            }
        }
        // getPitcherOuts();

        if (selectedPitcher === "all") {
            getAllOuts();
        } else {
            getPitcherOuts();
        }
    }, [selectedPitcher]);

    // this hook will handle data preprocessing after it has been fetched from the server
    useEffect(() => {
        if (!data || data.length === 0) {
            setData([]);
            //setDimensions([]);
            return;
        }

        // needed column names:
        // player_name, batter, pitcher, events not na, pitch_name

        // event types filterd for batter outs
        const outTypes = ["field_out", "strike_out", "strikeout_double_play", "grounded_into_double_play"];

        // new key to indicate whether the event was an out
        // remember this format as it adds a new "column" to the existing data object
        const processedData = data.map((d) => ({
            ...d,
            isOut: outTypes.includes(d.event)
        }));
        // find all unique pitch types
        const allPitchTypes = [...new Set(processedData.map((d) => d.pitch_name))].sort();

        // find total plate appearance counts for each batter
        const totalPAsByBatter = d3.rollup(
            processedData,
            (D) => D.length,
            (d) => d.batter
        );

        // group data by each batter and each out type
        // this will make up the data for each line
        const groupedByBatterAndOut = d3.group(
            processedData.filter((d) => d.isOut),
            (d) => d.batter,
            (d) => d.event
        );

        let transformedPlotData = [];

        // loops for each batter first with outMap being array of each out type associated with the batter
        for (const [batter, outMap] of groupedByBatterAndOut) {
            // loops through each out type with pitchesForOut being array of the pitches associated with that
            // batter and that out type
            for (const [outType, pitchesForOut] of outMap) {
                let lineData = {
                    batterId: batter,
                    outType: outType
                };

                const countsThisOutForBatter = pitchesForOut.length;
                const totalPAsForThisBatter = totalPAsByBatter.get(batter);
                // this is how to add new key to object
                lineData.outPercentage = (countsThisOutForBatter / totalPAsForThisBatter) * 100;

                // initializes out/batter count for each pitch type to 0
                allPitchTypes.forEach((pitchType) => {
                    lineData[pitchType] = 0;
                });

                pitchesForOut,forEach((pa) => {
                    // hasOwnProperty looks at whether the object has the corresponding property
                    // and does not inherit it
                    // I think the property name is pitch_name, assuming it is same as column name
                    if (lineData.hasOwnProperty(pa.pitch_name)) {
                        lineData[pa.pitch_name]++
                    }
                });
                transformedPlotData.push(lineData);
            }
        }

        const plotDimensions = [
            "outPercentage",
            ...allPitchTypes
        ];

        setDimensions(plotDimensions);

        setPlotData(transformedPlotData);

    }, [data]);

    const handlePitcherChange = (event) => {
        setSelectedPitcher(event.target.value);
    };

    if (loading) return <div>Loading data...</div>;

    // drop down added below
    return (
        <div id="parallel-coords">
            <h2>Parallel Coordinates Plot of Outs For the Mariners' Offense Based on Pitch Type</h2>
            <label htmlFor="pitcher-filter">Filter by opposing pitcher: </label>
            <select id="pitcher-filter" value={selectedPitcher} onChange={handlePitcherChange}>
                {pitcherData.map(option => (
                    <option key={option.MLBID} value={option.MLBID}>
                        {option.MLBNAME}
                    </option>
                ))}
            </select>
            <ParallelPlot data={plotData} dimensions={dimensions}/>
        </div>
    );
};

export default ParallelCoords;