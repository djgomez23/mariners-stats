// need to add try/catch to other routes as well

const express = require("express");
const database = require("./connect");
const ObjectId = require("mongodb").ObjectId

let marinersStatsRoutes = express.Router();

// 1. Retrieve all (probably won't be used in app)
// http://localhost:3000/mariners_stats
marinersStatsRoutes.route("/mariners_stats").get(async (request, response) => {
    let db = database.getDB();
    let data = await db.collection("mariners_stats").find({}).toArray();
    if (data.length > 0) {
        response.json(data);
    } else {
        throw new Error("Data not found");
    }
});

// 2. Retrieve all plate appearance results (i.e., not all pitches, just the final)
// events should not equal NA for this
// this will at the very least be used for the parallel coords plot
// http://localhost:3000/mariners_stats/outs
marinersStatsRoutes.route("/mariners_stats/outs").get(async (request, response) => {
    let db = database.getDB();
    let data = await db.collection("mariners_stats").find({"events": {"$exists": true, "$ne" : ""}}).toArray();
    if (data.length > 0) {
        // express equivalent of a return statement
        response.json(data);
    } else {
        throw new Error("Data not found");
    }
});

// 3. Retrieve all plate appearance results (i.e., not all pitches, just the final) by pitcher
// events should not equal NA for this
// this will at the very least be used for the parallel coords plot
// http://localhost:3000/mariners_stats/outs/:pitcher
marinersStatsRoutes.route("/mariners_stats/outs/:pitcher").get(async (request, response) => {
    let db = database.getDB();
    const pitcherId = parseInt(request.params.pitcher);
    if (isNaN(pitcherId)) {
        return response.status(400).json({ message: "Invalid pitcher ID provided. Must be a number." });
    }
    try {
        let data = await db.collection("mariners_stats").find({"events": {"$exists": true, "$ne" : ""}, "pitcher": {"$eq": pitcherId}}).toArray();
        if (data.length > 0) {
            // express equivalent of a return statement
            response.json(data);
        } else {
            response.status(404).json({ message: "Data not found for the specified pitcher." });
        }
    } catch (error) {
        // Catch any errors that occur during the database operation
        console.error("Error retrieving data:", error);
        response.status(500).json({ message: "Internal Server Error during data retrieval." });
    }
});

// 4. Retrieve by pitcher
// http://localhost:3000/mariners_stats/pitcher/:pitcher
marinersStatsRoutes.route("/mariners_stats/pitcher/:pitcher").get(async (request, response) => {
    let db = database.getDB();
    const pitcherId = parseInt(request.params.pitcher);

    // Basic validation: Check if conversion resulted in a valid number
    if (isNaN(pitcherId)) {
        return response.status(400).json({ message: "Invalid pitcher ID provided. Must be a number." });
    }
    try {
        let data = await db.collection("mariners_stats").find({"pitcher": {"$eq": pitcherId}}).toArray();
        if (data.length > 0) {
            // express equivalent of a return statement
            response.json(data);
        } else {
            response.status(404).json({ message: "Data not found for the specified pitcher." });
        }
    } catch (error) {
        // Catch any errors that occur during the database operation
        console.error("Error retrieving pitcher data:", error);
        response.status(500).json({ message: "Internal Server Error during data retrieval." });
    }
});

// 5. Retrieve by hitter
// http://localhost:3000/mariners_stats/batter/:batter
marinersStatsRoutes.route("/mariners_stats/batter/:batter").get(async (request, response) => {
    let db = database.getDB();
    const batterId = parseInt(request.params.batter);

    // Basic validation: Check if conversion resulted in a valid number
    if (isNaN(batterId)) {
        return response.status(400).json({ message: "Invalid batter ID provided. Must be a number." });
    }
    try {
        let data = await db.collection("mariners_stats").find({"batter": {"$eq": batterId}}).toArray();
        if (data.length > 0) {
            // express equivalent of a return statement
            response.json(data);
        } else {
            response.status(404).json({ message: "Data not found for the specified batter." });
        }
    } catch (error) {
        // Catch any errors that occur during the database operation
        console.error("Error retrieving pitcher data:", error);
        response.status(500).json({ message: "Internal Server Error during data retrieval." });
    }
});

module.exports = marinersStatsRoutes;