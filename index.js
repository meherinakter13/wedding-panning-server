const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ufmbf.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(cors());
app.use(fileUpload());

const port = 5000;

app.get('/', (req, res) => {
    res.send("hello from db it's working working")
})


client.connect(err => {
  const serviceCollection = client.db("WeddingPlanningDB").collection("services");
  const reviewCollection = client.db("WeddingPlanningDB").collection("reviews");
  const bookingCollection = client.db("WeddingPlanningDB").collection("bookings");
  const adminCollection = client.db("WeddingPlanningDB").collection("admin");

//   add services
  app.post('/addServices',(req, res) => {
    const file = req.files.file;
    const serviceName = req.body.serviceName;
    const price = req.body.price;
    const description = req.body.description;
    console.log(file, serviceName, price, description);
    const newImg = file.data;
          const encImg = newImg.toString('base64');
  
          var image = {
              contentType: file.mimetype,
              size: file.size,
              img: Buffer.from(encImg, 'base64')
          };
  
          serviceCollection.insertOne({ serviceName, price, image, description })
              .then(result => {
                  res.send(result.insertedCount > 0);
              })
      })
    // get services
    app.get('/services', (req, res) => {
        serviceCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });


    // add reviews
app.post('/addReviews', (req, res) => {
    reviewCollection.insertOne(req.body)
        .then(result => {
            res.send(result)

        })
})
    // get reviews
    app.get('/reviews', (req, res) => {
        reviewCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });
//get single booked service
    app.get('/booking/:id',(req, res) =>{
        const id = ObjectID(req.params.id)
        serviceCollection.find({_id : id})
        .toArray((err,services) => {
        res.send(services[0]);
        })
    })
   
 // Add bookings in database 
 app.post('/addAllBookings',(req, res) => {
    const allBookings = req.body;
    bookingCollection.insertOne(allBookings)
    .then(result => {
        res.send(result.insertedCount > 0)
    })
})

// get all booking data
app.get('/orderList', (req, res) => {
    bookingCollection.find()
      .toArray((err, orders) => {
        res.send(orders);
      })
  })

// update status
app.patch('/updateOrderList/:id', (req, res) => {
    const id = ObjectID(req.params.id)
    bookingCollection.updateOne({ _id: id },
            {
                $set: { status: req.body.status }
            })
            .then(result => {
                res.send(result.modifiedCount > 0 )
            })
    })

// delete service

app.delete('/deleteService/:id', (req, res) => {
    const id = ObjectID(req.params.id)
    serviceCollection.deleteOne({ _id: id })
      .then(result => {
        res.send(result.deletedCount > 0)
      })
  })

//   booking list 
 app.get('/bookingList', (req, res) => {
    bookingCollection.find({ email: req.query.email })
        .toArray((err, courses) => {
            res.send(courses);
        })
})

// add a Admin details
app.post('/addAdmin',(req, res) => {
    const email = req.body.email;
    console.log(email);
    adminCollection.insertOne({ email })
              .then(result => {
                  res.send(result.insertedCount > 0);
              })
      })
      // get admin

app.get('/admin', (req, res) => {
    adminCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })

})
// check admin
app.post('/isAdmin', (req, res) => {
    const email = req.body.email;
    adminCollection.find({ email: email })
        .toArray((err, admins) => {
            res.send(admins.length > 0);
        })
})

});








app.listen(process.env.PORT || port)