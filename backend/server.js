// note: require fully runs the file called
// require is the same as import/export statement in react
const connect = require("./connect");
// don't use dot slash when importing package
const express = require("express");
const cors = require("cors");
const marinersStats = require("./marinersStatsRoutes");
const playerIds = require("./playerIdsRoutes");

// express() instantiates express app; now, we can interact with app through variable
const app = express();

// for now, will run app on local machine for testing

const PORT = 3000;

// app.use mounts middleware
// cors() tells express how to handle sharing resources across domains
app.use(cors());
// express.json() tells express to process requests in json
app.use(express.json());
// to mount routes and make accessible to other parts of code
app.use(marinersStats);
app.use(playerIds);

// creates server (i.e., listens for requests)
app.listen(PORT, () => {
    connect.connectToServer();
    console.log(`Server is running on port ${PORT}`)
})