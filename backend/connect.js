const { MongoClient, ServerApiVersion } = require('mongodb');
// access config file for environmental variables
require("dotenv").config({path: "./config.env"});

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.ATLAS_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let database;

module.exports = {
  // create initial connection between code and database
  connectToServer: () => {
    database = client.db("mariners_proj");
  },
  // use getDB to get database after connect to server by calling connectToServer
  getDB: () => {
    return database;
  }
};

/*async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);*/