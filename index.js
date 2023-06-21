const { MongoClient, ServerApiVersion } = require('mongodb');

require('dotenv').config();

const express=require('express');
const cors=require('cors');
const app=express();
const port=process.env.PORT||5000;

// middleweres
app.use(cors());
app.use(express());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.bzjru.mongodb.net/?retryWrites=true&w=majority`;

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
   const serviceCollection=client.db('geniouscar').collection('services');

   app.get('/services', async(req,res)=>{
    const quarry={};
    const cursor=serviceCollection.find(quarry);
    const services= await cursor.toArray();
    res.send(services);
   })

  } finally {
  
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('genious car server ranning');
});

app.listen(port,()=>{
    console.log(`genous car server in on ${port}`);
})