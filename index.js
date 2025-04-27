const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// Middleware 
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sou5t.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // ✅ Connect the client to the server
    await client.connect();
    const movieCollection = client.db('movieDb').collection('movies');
    const favoriteCollection = client.db('movieDb').collection('favorites');
    const userCollection = client.db('movieDb').collection('users')

    app.get('/movies',async(req,res)=>{
        const cursor = movieCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    app.get('/movies/:id',async (req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await movieCollection.findOne(query);
      res.send(result);
    })


    app.post('/movies', async (req, res) => {
      const newMovie = req.body;
      const result = await movieCollection.insertOne(newMovie);
      res.send(result);
    });

    app.put('/movies/:id', async(req,res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const options = {upsert: true};
      const updateMovie = req.body;
      const movie = {
        $set:{
          title: updateMovie.title,
          genre:updateMovie.genre,
          duration:updateMovie.duration,
          releaseYear:updateMovie.releaseYear,
          rating :updateMovie.rating ,
          summary:updateMovie.summary,
          poster:updateMovie.poster,

        }
      }
      const result = await movieCollection.updateOne(filter,movie,options)
      res.send(result);
    })

    // Add this inside your `run()` function, after the other routes

// Get Top 6 Featured Movies (sorted by rating)
app.get('/featured-movies', async (req, res) => {
  try {
    const cursor = movieCollection.find().sort({ rating: -1 }).limit(6);
    const result = await cursor.toArray();
    res.send(result);
  } catch (error) {
    console.error('Error fetching featured movies:', error);
    res.status(500).send({ message: 'Server error while fetching featured movies' });
  }
});
  
    app.delete('/movies/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await movieCollection.deleteOne(query);
      res.send(result);
    })
    // For adding a movie to favorites
    app.post('/favorites', async (req, res) => {
      const favoriteMovie = req.body;
      try {
        const result = await favoriteCollection.insertOne(favoriteMovie);
        res.send(result);
      } catch (error) {
        console.error('Error adding favorite movie:', error);
        res.status(500).send({ message: 'Failed to add movie to favorites' });
      }
    });

    // Users Related API

    app.get('/users',async(req,res)=>{
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })
    app.post('/users',async(req,res) =>{
      const newUser = req.body;
      console.log('creating new user' ,newUser);
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    })

    app.delete('/users/:id',async(req,res) =>{
      const id = req.params.id;
      const query = {_id:new ObjectId(id)}
      const result = await userCollection.deleteOne(query);
      res.send(result);
    })








    // For Favorites Movie 
    app.post('/favorites', async (req, res) => {
      const favorite = req.body;
      const result = await favoriteCollection.insertOne(favorite);
      res.send(result);
    });
    

    app.get('/favorites', async (req, res) => {
      const userEmail = req.query.email;
      const query = { userEmail: userEmail };
      const result = await favoriteCollection.find(query).toArray();
      res.send(result);
    });

    app.delete('/favorites/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await favoriteCollection.deleteOne(query);
      res.send(result);
    });



    // ✅ Confirm DB connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
  }
  
}

run().catch(console.dir);

// Test route
app.get('/', (req, res) => {
  res.send('Film Fusion server is running');
});

app.listen(port, () => {
  console.log(`Film Fusion Server is running on port: ${port}`);
});
