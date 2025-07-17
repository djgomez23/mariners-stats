// need to add try/catch to other routes as well

const express = require("express");
const database = require("./connect");
const ObjectId = require("mongodb").ObjectId

let playerIdsRoutes = express.Router();

// 1. Retrieve all (probably won't be used in app)
// http://localhost:3000/player_ids
playerIdsRoutes.route("/player_ids").get(async (request, response) => {
    let db = database.getDB();
    let data = await db.collection("player_ids").find({}).toArray();
    if (data.length > 0) {
        response.json(data);
    } else {
        throw new Error("Data not found");
    }
});

// 2. Retrieve by MLB ID
// http://localhost:3000/player_ids/:mlbId
playerIdsRoutes.route("/player_ids/player/:mlbId").get(async (request, response) => {
    let db = database.getDB();
    const mlbId = parseInt(request.params.mlbId);

    // Basic validation: Check if conversion resulted in a valid number
    if (isNaN(mlbId)) {
        return response.status(400).json({ message: "Invalid MLB ID provided. Must be a number." });
    }
    try {
        let data = await db.collection("player_ids").find({"MLBID": {"$eq": mlbId}}).toArray();
        if (data.length > 0) {
            // express equivalent of a return statement
            response.json(data);
        } else {
            response.status(404).json({ message: "Data not found for the specified player." });
        }
    } catch (error) {
        // Catch any errors that occur during the database operation
        console.error("Error retrieving player data:", error);
        response.status(500).json({ message: "Internal Server Error during data retrieval." });
    }
});

// 3. Retrieve all pitchers
// will how to filter for correct list of pitchers based on other data in the frontend
// http://localhost:3000/player_ids/pitchers
playerIdsRoutes.route("/player_ids/pitchers").get(async (request, response) => {
    let db = database.getDB();
    try {
        let data = await db.collection("player_ids").find({"POS": "P"}).toArray();
        if (data.length > 0) {
            // express equivalent of a return statement
            response.json(data);
        } else {
            response.status(404).json({ message: "Pitchers not found." });
        }
    } catch (error) {
        // Catch any errors that occur during the database operation
        console.error("Error retrieving pitcher data:", error);
        response.status(500).json({ message: "Internal Server Error during data retrieval." });
    }
});

module.exports = playerIdsRoutes;