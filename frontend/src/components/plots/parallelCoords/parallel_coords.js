// NOT TESTED

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import axios from "axios";

const ParallelCoords = () => {
    const ref = useRef();
    const [data, setData] = useState();
    const [pitcherData, setPitcherData] = useState();
    const [selectedPitcher, setSelectedPitcher] = useState();
    const [plotData, setPlotData] = useState([]);
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
        // not sure if this should be in a separate hook with empty dependency because this will happen
        // when the page renders for the first time and is not rooted in user interaction
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

    // this will change when the user selects a pitcher
    useEffect(() => {
        // not sure if additional call is needed such that not all player id
        // data is retrieved but just those that match the subset of data that is used in
        // the plot

        // this call gets all outs for all pitchers the mariners have faced
        async function getAllOuts() {
            const response = await axios.get("http://localhost:3000/mariners_stats/outs");
            // if request is successful, set state
            if (response.status === 200) {
                setData(response.data);
                setLoading(false);
            }
        }
        getAllOuts();

        // need separate function for pitcher specific outs
        async function getPitcherOuts() {
            const response = await axios.get(`http://localhost:3000/mariners_stats/outs/${selectedPitcher}`);
            // if request is successful, set state
            if (response.status === 2000) {
                setData(response.data);
                setLoading(false);
            }
        }
        getPitcherOuts();
    }, [selectedPitcher]);

    // this hook will handle data preprocessing after it has been fetched from the server
    useEffect(() => {
        if (!data || data.length === 0) {
            setData([]);
            //setDimensions([]);
            return;
        }
        // needed column names
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

        setPlotData(transformedPlotData);

        // everything below here should probably be in its own component for sake of modularity

        const margin = {top: 30, right: 50, bottom: 10, left: 50};
        const width = 460 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
        const svg = d3.select(ref.current)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

        const color = d3.scaleOrdinal()
            .domain(outTypes)
            .range(d3.schemeTableau10);

        let y = {};

        for (i in plotDimensions) {
            const name = plotDimensions[i];
            y[name] = d3.scaleLinear()
                .domain([0, 100])
                .range([height, 0]);
        }

        const x = d3.scalePoint()
            .range([0, width])
            .domain(plotDimensions);

        // highlight pitch type that is hovered
        const highlight = (d) => {
            const selectedOut = d.outType;

            // turn all groups gray first
            d3.selectAll(".line")
                .transition()
                .duration(200)
                .style("stroke", "lightgrey")
                .style("opacity", "0.2");

            // add color to selected group
            d3.selectAll("." + selectedOut)
                .transition()
                .duration(200)
                .style("stroke", color(selectedOut))
                .style("opacity", "1");
        };

        // unhighlight
        const doNotHighlight = (d) => {
            d3.selectAll(".line")
                .transition()
                .duration(200)
                .delay(1000)
                .style("stroke", (d) => {
                    return (color(d.outType));
                })
                .style("opacity", "1");
        }

        function path(d) {
            return d3.line()(plotDimensions.map((i) => [x(i), y[i](d[i])]));
        }

        // draw the lines
        svg.selectAll("paths")
            .data(transformedPlotData)
            .enter()
            .append("path")
            .attr("class", (d) => "line-" + d.outType)
            .attr("d", path)
            .style("fill", "none")
            .style("stroke", (d) => color(d.outType))
            .style("opacity", 0.5)
            .on("mouseover", highlight)
            .on("mouseout", doNotHighlight);

        // draw the axes
        svg.selectAll("parallel-axes")
            .data(plotDimensions)
            .enter()
            .append("g")
            .attr("class", "axis")
            .attr("transform", (d) => "translate(" + x(d) + ")")
            .each((d) => d3.select(this).call(d3.axisLeft().ticks(5).scale(y[d])))
            // add title
            .append("text")
            .style("text-anchor", "middle")
            .attr("y", -9)
            .text((d) => d)
            .style("fill", "black");

    }, [data]);

    return (
        <svg id="parallel-coords" ref={ref} />
    );
};

export default ParallelCoords;