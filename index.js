const express = require("express");
const port = process.env.PORT || 5000;
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();

// middleware 
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gbdj4eh.mongodb.net/?retryWrites=true&w=majority`;

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
        await client.connect();

        const database = client.db("carDoctorDB");
        const services = database.collection("services");
        const bookings = database.collection("bookings");

        // all get api 
        // __________________________

        // get all services 
        app.get("/services", async (req, res) => {
            const cursor = services.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        // get single service 
        app.get("/services/:id", async (req, res) => {
            const productId = req.params.id;
            // console.log(productId);
            const query = { _id: new ObjectId(productId) };
            const options = {
                projection: { service_id: 1, img: 1, title: 1, price: 1 },
            };
            const service = await services.findOne(query, options);
            res.send(service)
        });

        // get user bookings 
        app.get("/bookings", async (req, res) => {
            const userEmail = req.query.email;
            // console.log(userEmail);


            const query = { email: userEmail };
            const options = {
                sort: { title: 1 },
                projection: { _id: 0, title: 1, imdb: 1 },
            };

            const cursor = bookings.find(query);
            const userBooking = await cursor.toArray();
            res.send(userBooking);
        });

        // __________________________________


        // all post request 
        // _____________________________________

        // post a booking 
        app.post("/bookings", async (req, res) => {
            const data = req.body;
            const result = await bookings.insertOne(data);
            res.send(result);
        });

        // ________________________________________


        // all delete api 
        // _________________________________

        // delete single booking 
        app.delete("/bookings/:id", async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const query = { _id: new ObjectId(id) };
            const result = await bookings.deleteOne(query);
            res.send(result);
        });

        // _________________________________


        // all putch api 
        // _______________________________________

        // update single booking 
        app.patch("/bookings/:id", async(req, res) => {
            const id = req.params.id;
            const data = req.body;
            console.log(data);
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    status: data.status
                },
            };
            const result = await bookings.updateOne(filter, updateDoc);
            res.send(result);
        })


        // _______________________________________



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get("/", (req, res) => {
    res.send("Hello Abu Sayed");
});

app.listen(port, () => {
    console.log(`app is running on port ${port}`);
});