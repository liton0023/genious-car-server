const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

require('dotenv').config();

const express=require('express');
const cors=require('cors');
const jwt=require('jsonwebtoken');
const app=express();
const port=process.env.PORT||5000;

// middleweres
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.bzjru.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// jwt verify

const verifyJWt=(req,res,next)=>{
  // console.log('heating the jwt')
  const authorization=req.headers.authorization;
  // console.log(authorization)
  if(!authorization){
    return res.status(401).send({error:true,massage:'Unauthoriization'});
  }
  const token=authorization.split(' ')[1];
  // console.log(token)
  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
    if(err){
      return res.status(401).send({error:true,massage:'Unauthoriization'});
    }
    req.decoded=decoded;
    // console.log(decoded)
    next();
  })

}

async function run() {
  try {
   const serviceCollection=client.db('geniouscar').collection('services');
   const ordersCollection=client.db('geniouscar').collection('orders');
//    console.log(ordersCollection);

   app.get('/services', async(req,res)=>{
    const quarry={};
    const cursor=serviceCollection.find(quarry);
    const services= await cursor.toArray();
    res.send(services);
   })

   app.get('/services/:id',async(req,res)=>{
    const id=req.params.id;
    const query= { _id: new ObjectId(id) }
    const service=await serviceCollection.findOne(query);
    res.send(service);
   })

  //  jwt token

  app.post('/jwt', (req, res) => {
    const user = req.body;
    // console.log(user);
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    // console.log(token);
    res.send({token});
})


  //  orders section

  app.get('/orders',verifyJWt, async(req,res)=>{
    const decoded=req.decoded;
    if(decoded.email!=req.query.email){
       return res.status(403).send({error:1, massage:'forbidden access'})
    }
    let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await ordersCollection.find(query).toArray();
            res.send(result);
  })

   app.post('/orders', async (req, res) => {
    const order = req.body;
    const result = await ordersCollection.insertOne(order)
    // console.log(result);
    res.send(result); 
  });

  app.patch('/orders/:id', async(req,res)=>{
    const id=req.params.id;
    const filter={_id: new ObjectId(id)};
    const updatedOrders=req.body;
    console.log(updatedOrders);

    const updactdoc={
      $set:{
        status:updatedOrders.status
      },

    }
    const result= await ordersCollection.updateOne(filter,updactdoc);
    res.send(result);
  })

  app.delete('/orders/:id',async(req,res)=>{
    const id=req.params.id;
    const quary={_id: new ObjectId(id)};

    const result=await ordersCollection.deleteOne(quary);
    res.send(result);
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