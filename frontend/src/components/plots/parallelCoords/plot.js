// Name: Damita Gomez
// File Description: After importing data and dimensions, builds DOM
// elements for parallel coordinates plot to be added through parallel_coords.js

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";

const ParallelPlot = ({ dimensions, data, colorScale }) => {
    const ref = useRef();
    // const [data, setData] = useState();
    // const [plotData, setPlotData] = useState([]);
    // const [loading, setLoading] = useState(true);

    // just need to return an svg tag with the reference key back to the useEffect hook
    // with the plot information

    useEffect(() => {
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
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        const color = d3.scaleOrdinal()
            .domain(colorScale)
            .range(d3.schemeTableau10);

        let y = {};

        for (const i in dimensions) {
            const name = dimensions[i];
            y[name] = d3.scaleLinear()
                .domain([0, 100])
                .range([height, 0]);
        }

        const x = d3.scalePoint()
            .range([0, width])
            .domain(dimensions);

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
            return d3.line()(dimensions.map((i) => [x(i), y[i](d[i])]));
        }

        // draw the lines
        svg.selectAll("paths")
            .data(data)
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
            .data(dimensions)
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
    }, []);

    return (
        <svg id="parallel-coords" ref={ref} />
    );
};

export default ParallelPlot;