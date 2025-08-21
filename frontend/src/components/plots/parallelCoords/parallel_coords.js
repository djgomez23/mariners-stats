// TO DO:
// have not yet tested the pitcher filtering
// need to check the line colors
// also want to adjust the units for the axes; it's confusing with them being percentages and counts; just stick to percentages
// also need to clear the paths upon rerendering
// not sure if the axes should be cleared too or if its possible to add animation to transform them when the pitcher changes
// need to map batter IDs to player names

import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import axios from "axios";
import ParallelPlot from "./plot";

const ParallelCoords = () => {
    // const ref = useRef();
    const [data, setData] = useState([]);
    const [pitcherData, setPitcherData] = useState([]);
    const [filteredPitchers, setFilteredPitchers] = useState([]);
    const [selectedPitcher, setSelectedPitcher] = useState("all");
    const [plotData, setPlotData] = useState([]);
    const [dimensions, setDimensions] = useState([]);
    const [outTypeScale, setOutTypeScale] = useState([]);
    const [loading, setLoading] = useState(true);
    // const [rawData, setRawData] = useState();
    // const [error, setError] = useState(false);


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
        async function getPitchers() {
            console.log("Fetching pitchers");
            const response = await axios.get("http://localhost:3000/player_ids/pitchers");
            // if request is successful, set state
            // confirmed that the pitcher data is being set appropriately
            if (response.status === 200) {
                setPitcherData(response.data);
            }
        }
        getPitchers();
    }, []);

    // this will rerun when selectedPitcher changes based on user interaction
    useEffect(() => {
        // console.log("Selected Pitcher hook");
        // this call gets all outs for all pitchers the mariners have faced
        // console.log("set pitchers:", pitcherData);
        async function getAllOuts() {
            try {
                const response = await axios.get("http://localhost:3000/mariners_stats/outs");
                // if request is successful, set state
                // out data is not being set properly for whatever reason
                // printing out response.data shows the data, but setData is not working
                if (response.status === 200) {
                    console.log(response.status);
                    // console.log(response.data);
                    setData(response.data);
                    filterData(response.data);
                }
            } catch (error) {
                console.error("Error fetching all outs:", error);
            } finally {
                setLoading(false);
            }
        }
        // getAllOuts();

        // need separate function for pitcher specific outs
        async function getPitcherOuts() {
            try {
                // this could cause an issue based on data type
                // in other words, I can't remember whether selectedPitcher needs to be read as an int or string
                const response = await axios.get(`http://localhost:3000/mariners_stats/outs/${selectedPitcher}`);
                // if request is successful, set state
                if (response.status === 200) {
                    setData(response.data);
                    // console.log(data);
                    filterData(response.data);
                }
            } catch (error) {
                console.error("Error fetching pitcher specific outs:", error);
            } finally {
                setLoading(false);
            }
        }
        // getPitcherOuts();

        if (selectedPitcher === "all") {
            console.log("Fetching all outs");
            getAllOuts();
        } else {
            console.log("Fetching specific pitcher outs");
            getPitcherOuts();
        }
    }, [selectedPitcher, pitcherData]);

    // this function is supposed to handle data preprocessing after it has been fetched from the server
    // the data is being fetched correctly from the server
    // but there is an issue with the timing
    // the function still tries to run before the data is loaded
    function filterData(unfilteredData) {
        console.log("Begin filtering");
        if (!unfilteredData || unfilteredData.length === 0) {
            setData([]);
            return;
        }


        // needed column names:
        // player_name, batter, pitcher, events not na, pitch_name

        // event types filterd for batter outs
        const outTypes = ["field_out", "strike_out", "strikeout_double_play", "grounded_into_double_play"];
        // setOutTypeScale(outTypes);

        // new key to indicate whether the event was an out
        // remember this format as it adds a new "column" to the existing data object
        
        const processedData = unfilteredData.map((d) => ({
            ...d,
            isOut: outTypes.includes(d.events)
        }));
        // find all unique pitch types
        const allPitchTypes = [...new Set(processedData.map((d) => d.pitch_name))].sort();
        setOutTypeScale(allPitchTypes);

        // find total plate appearance counts for each batter
        const totalPAsByBatter = d3.rollup(
            processedData,
            (D) => D.length,
            (d) => d.batter
        );

        // group data by each batter and each out type
        // this will make up the data for each line
        const groupedByBatterAndPitch = d3.group(
            processedData.filter((d) => d.isOut),
            (d) => d.batter,
            (d) => d.pitch_name
        );

        let transformedPlotData = [];

        // loops through each batter first with pitchMap being array of each pitch type associated with the batter
        for (const [batter, pitchMap] of groupedByBatterAndPitch) {
            // loops through each out type with outsForPitch being array of the outs associated with that
            // batter and that pitch type
            for (const [pitchType, outsForPitch] of pitchMap) {
                let lineData = {
                    batterId: batter,
                    pitchType: pitchType
                };

                const countsThisPitchForBatter = outsForPitch.length;
                const totalPAsForThisBatter = totalPAsByBatter.get(batter);
                // this is how to add new key to object
                lineData.outPercentage = (countsThisPitchForBatter / totalPAsForThisBatter) * 100;

                // initializes out/batter count for each pitch type to 0
                outTypes.forEach((outType) => {
                    lineData[outType] = 0;
                });

                let paEvents = new Set();

                outsForPitch.forEach((pa) => {
                    // hasOwnProperty looks at whether the object has the corresponding property
                    // and does not inherit it
                    // originally pa.pitch_name when the axes were switched
                    if (lineData.hasOwnProperty(pa.events)) {
                        paEvents.add(pa.events);
                        lineData[pa.events]++;
                    }
                });

                // loop through the plate appearance events and change the count for the associated events
                // to a percentage (i.e., divide by total plate appearances)
                // console.log("plate appearance events:", paEvents);
                paEvents.forEach((pa) => {
                    // double check that the event exists first
                    if (lineData.hasOwnProperty(pa)) {
                        // not sure if this is allowed in JS
                        // console.log("out percentage:", lineData.outPercentage);
                        // console.log("line data:", lineData[pa]);
                        lineData[pa] = (lineData[pa] / totalPAsForThisBatter) * 100;
                    }
                });
                transformedPlotData.push(lineData);
            }
        }

        const plotDimensions = [
            "outPercentage",
            ...outTypes
        ];

        setDimensions(plotDimensions);


        // console.log(transformedPlotData);
        setPlotData(transformedPlotData);

        // filter pitchers from the player ID collection to match the pitchers listed in the
        // mariners stats database
        // need to check if this can be optimized
        const foundPitchers = [...new Set(unfilteredData.map((bat) => bat.pitcher))];
        let pitcherIntersection = [];
        for (const i of pitcherData) {
            if (foundPitchers.includes(i.MLBID)) {
                pitcherIntersection.push(i);
            }
        }
        setFilteredPitchers(pitcherIntersection);
    }

    const handlePitcherChange = (event) => {
        setSelectedPitcher(event.target.value);
    };
    
    if (loading) {
        console.log("Loading");
        return <div>Loading data...</div>;
    }


    // drop down added below
    return (
        <div id="parallel-coords-container">
            <h2>Parallel Coordinates Plot of Outs For the Mariners' Offense Based on Pitch Type</h2>
            <label htmlFor="pitcher-filter">Filter by opposing pitcher: </label>
            <select id="pitcher-filter" value={selectedPitcher} onChange={handlePitcherChange}>
                <option key="all"  value="all">Select Pitcher</option>
                {filteredPitchers.map(option => (
                    <option key={option.MLBID} value={option.MLBID}>
                        {option.MLBNAME}
                    </option>
                ))}
            </select>
            <ParallelPlot data={plotData} dimensions={dimensions} colorScale={outTypeScale}/>
        </div>
    );
};

export default ParallelCoords;