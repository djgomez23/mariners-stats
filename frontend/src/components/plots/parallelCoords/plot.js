import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";

const ParallelPlot = () => {
    const ref = useRef();
    const [data, setData] = useState();
    const [plotData, setPlotData] = useState([]);
    const [loading, setLoading] = useState(true);

    // just need to return an svg tag with the reference key back to the useEffect hook
    // with the plot information
};

export default ParallelPlot;