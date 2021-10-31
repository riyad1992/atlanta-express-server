const express = require('express')
const cors = require('cors')
const { MongoClient } = require('mongodb');
const app = express()
require('dotenv').config()
const ObjectId = require("mongodb").ObjectId;

const port = process.env.PORT || 5000
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@cluster0.3jq7x.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try {
        await client.connect()
        const database = client.db('online_booking');
        const serviceCollection = database.collection('services');
        const bookingCollection = database.collection('booking')
        const tourCollection = database.collection('tours')

        // GEt API
        app.get('/services', async(req, res) => {
            const cursor = serviceCollection.find({})
            const result = await cursor.toArray()
            res.send(result)
        })

        // Get Tours Api
        app.get('/tours', async(req, res) => {
            const cursor = tourCollection.find({})
            const result = await cursor.toArray()
            res.send(result)
        })

        // post Api
        app.post('/services', async (req, res) => {
            const newService = req.body;
            const result = await serviceCollection.insertOne(newService);
            res.json(result);
        });

        // GEt Single Service
        app.get('/services/:id', async (req, res) => {
            const cursor = serviceCollection.find({ _id: ObjectId(req.params.id) })
            const result = await cursor.toArray()
            res.send(result[0])
        })

        // Add Booking in Database
        app.post('/addBooking', (req, res) => {
            bookingCollection.insertOne(req.body).then(result => {
                res.send(result)
            })
        })


        // Get my bookings
        app.get('/myBooking/:email', (req, res) => {
            bookingCollection.find({ email: req.params.email }).toArray((err, result) => {
                res.send(result)
                // console.log(err)
            })
        })

        // Get All Bookings
        app.get('/allBooking', (req, res) => {
            bookingCollection.find({}).toArray((err, result) => {
                res.send(result)
                // console.log(err)
            })
        })

        // Get Single Booking 
        app.get('/allBooking/:id', async(req, res) => {
            const cursor = bookingCollection.find({ _id: req.params.id })
            const result = await cursor.toArray()
            res.send(result[0])
        })

        // DELETE API
        app.delete('/allBooking/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: id };
            const result = await bookingCollection.deleteOne(query);

            console.log('deleting user with id ', result);

            res.json(result);
        })


        //update product
        app.put("/update/:id", async (req, res) => {
            const id = req.params.id;
            const updatedName = req.body;
            const filter = { _id: id };

            bookingCollection
            .updateOne(filter, {
                $set: {
                name: updatedName.name,
                },
            })
            .then((result) => {
                res.send(result);
            });
        });

    }
    finally{
        // await client.close()
    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Running From SErver')
})

app.listen(port, () =>{
    console.log('Running from server', port)
})