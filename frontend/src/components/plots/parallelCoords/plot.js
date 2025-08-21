// Name: Damita Gomez
// File Description: After importing data and dimensions, builds DOM
// elements for parallel coordinates plot to be added through parallel_coords.js

// to start server:
// navigate to backend folder and type "node server.js"

// to launch frontend:
// navigate to frontend folder and type "npm start"

import React, { useRef } from "react";
import * as d3 from "d3";
import "d3-transition";

const ParallelPlot = ({ dimensions, data, colorScale }) => {
    const ref = useRef();
    // const [data, setData] = useState();
    // const [plotData, setPlotData] = useState([]);
    // const [loading, setLoading] = useState(true);

    // just need to return an svg tag with the reference key back to the useEffect hook
    // with the plot information

    const margin = {top: 30, right: 50, bottom: 10, left: 50};
    const width = 700 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

// append the svg object to the body of the page
    const svg = d3.select(ref.current)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("background-color", "#F3F6F7")
        //.attr("viewbox", `0 0 300 600`)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const colorPalette = [
        "#0D2D56",
        "#15498B",
        "#1D65C0",
        "#3983E1",
        "#6EA4E9",
        "#A3C5F1",
        "#C5CED3",
        "#B8FFFF",
        "#79FCFC",
        "#00D5D6",
        "#009899",
        "#005B5C"
    ];
    const color = d3.scaleOrdinal()
        .domain(colorScale)
        .range(colorPalette);
    
    const outTypes = ["field_out", "strike_out", "strikeout_double_play", "grounded_into_double_play"];
    
    let maxes = [];
    for (const outType of outTypes) {
        const outMax = d3.max(data, (d) => d[outType]);
        maxes.push(outMax);
    }

    const max = Math.max(...maxes);

    /*
    const yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0, max]);
    */

    let yScale = {};
    for (const i in dimensions) {
        yScale[dimensions[i]] = d3.scaleLinear()
            .domain([0, max])
            .range([height, 0]);
    }

    /*
    const yScale = useMemo(() => {
        const maxes = [];
        for (const pitchType of pitchTypes) {
            const outMax = d3.max(data, (d) => d[pitchType]);
            maxes.push(outMax);
        }
        const max = Math.max(maxes);
        return d3.scaleLinear()
            .range([height, 0])
            .domain([0, max]);
    }, [data, height]);
    */

    const xScale = d3.scalePoint()
        .range([0, width])
        .domain(dimensions);

    // highlight pitch type that is hovered
    const highlight = (d) => {
        const selectedOut = d.pitchType;

        // turn all groups gray first
        d3.selectAll(".pitch-out")
            .transition()
            .duration(100)
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
        d3.selectAll(".pitch-out")
            .transition()
            .duration(200)
            .delay(1000)
            .style("stroke", (d) => {
                return (color(d.pitchType));
            })
            .style("opacity", "1");
    }

    function path(d) {
        return d3.line()(dimensions.map((i) => [xScale(i), yScale[i](d[i])]));
    }

    // draw the axes
    svg.append("g")
        .attr("class", "parallel-axes")
        .selectAll("parallel-axes")
        .data(dimensions)
        .join("g")
        .attr("class", "axis")
        .attr("transform", (d) => "translate(" + xScale(d) + ")")
        .each(function(d) { d3.select(this).call(d3.axisLeft().ticks(5).scale(yScale[d])); })
        // add title
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text((d) => d)
        .style("fill", "black");

    // might want to add lines as a function
    // draw the lines
    const plotPaths = svg.selectAll("path")
        .data(data)
        .enter()
        .append("path")
        .attr("class", (d) => "pitch-out " + d.pitchType + " " + d.outType)
        .attr("d", path)
        .style("fill", "none")
        .style("stroke", (d) => color(d.pitchType))
        .style("opacity", 0.5)
        .on("mouseover", highlight)
        .on("mouseout", doNotHighlight);

    plotPaths.exit()
        .remove();

    // will want this to update automatically, so needs to be triggered properly somehow
    // I think that this will eventually replace the path creation above
    // only want to implement this after testing that the pitcher filter works
    function updateLines() {
        svg.selectAll(".pitch-out")
            .data(data)
            .join("path")
            .attr("class", (d) => "pitch-out " + d.pitchType + " " + d.outType)
            .transition()
            .attr("d", path)
            .style("fill", "none")
            .style("stroke", (d) => color(d.pitchType))
            .style("opacity", 0.5)
            .on("mouseover", highlight)
            .on("mouseout", doNotHighlight);
    }

    return (
        <svg id="parallel-coords" ref={ref} />
    );
};

export default ParallelPlot;