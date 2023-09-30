// Import required modules
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb'); // MongoDB
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Create Express app
const app = express();

// Use CORS middleware
app.use(cors());

// Parse JSON request bodies
app.use(express.json());


// Connect to MongoDB
// const uri = process.env.MONGODB_URI;
// const uri = "mongodb+srv://<username>:<password>@cluster0.g5cwrlz.mongodb.net/?retryWrites=true&w=majority";
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.g5cwrlz.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        // Connect the client to the server	(optional starting in v4.7)
        client.connect();

        const tripCollection = client.db("trip-haven").collection("trip");
        const cartCollection = client.db("trip-haven").collection("carts");

        // Write Here GET, PUT, UPDATE, DELETE code
        app.get("/trip", async (req, res) => {
            const cursor = tripCollection.find();
            const trip = await cursor.toArray();
            res.send(trip);
        });

        // Step 1: Get single item for view
        app.get("/view-trips/:id", async (req, res) => {
            const id = req.params.id;
            // console.log(id); 
            const query = {
                _id: new ObjectId(id)
            };
            const result = await tripCollection.findOne(query);
            res.send(result);
        });

        // Get item from carts
        app.get("/carts", async (req, res) => {
            const email = req.query.email;

            if (!email) {
                return res.status(400).send({ error: true, message: 'Missing email' });
            }

            const query = {
                email: email
            };

            const result = await cartCollection.find(query).toArray();
            res.send(result);
        });


        // Add to cart
        app.post("/carts", async (req, res) => {
            const item = req.body;
            // console.log(item);
            const result = await cartCollection.insertOne(item);
            res.send(result);
        });



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
    }
}
run().catch(console.dir);



// Define a test route
app.get('/', (req, res) => {
    res.send('Server is running!');
});


// Start the server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});