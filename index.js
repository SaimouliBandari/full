require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const { request } = require('express');
const mongoose = require('mongoose');
const urlExists = require('node:url');
const dns = require('dns');

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URL, {useNewUrlParser : true, useUnifiedTopology: true}, (err) => {
  if(err) console.log(err);
  else
    console.log("connected to database");
});

const UrlSchema = new mongoose.Schema({
  original : {type : String, required: true},
  short : Number
});

let shortUrl = mongoose.model('shortUrl', UrlSchema);


app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

//let responseObject= {};
// app.post("/api/shorturl",bodyParser.urlencoded({extended: false}) ,(req, res) => {
//   let inputUrl = req.body['url'];
  
//     if(inputUrl === ""){
//       responseObject["error"] = "Invalid URL";
//       res.send(responseObject);
//     }
//     urlExists(inputUrl,  (err, exists) => {
//       if(exists){
//         responseObject["original_url"] = inputUrl;
//       }else{
//         responseObject["error"] = "Invalid URL";
//       }
//     });

    







  
// });


app.post("/api/shorturl", function(req, res) {
  let urlRegex = /https:\/\/www.|http:\/\/www./g;
  
  dns.lookup(req.body.url.replace(urlRegex, ""), (err, address, family) => {
    if (err) {
      res.json({"error":"invalid URL"});
    } else {
      shortUrl
        .find()
        .exec()
        .then(data => {
          new shortUrl({
            short: data.length + 1,
            original: req.body.url
          })
            .save()
            .then(() => {
              res.json({
                original_url: req.body.url,
                short_url: data.length + 1
              });
            })
            .catch(err => {
              res.json(err);
            });
        });
    }
  });
});

app.get("/api/shorturl/:number", function(req, res) {
  let input = req.params.number;
   shortUrl.findOne({short : input}, (err, result) => {
      if(!err && result != undefined){
          res.redirect(result.original);
      }
   })
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});


