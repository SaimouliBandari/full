'use strict';
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const { request } = require('express');
const mongoose = require('mongoose');
const urlExists = require('node:url');
const dns = require('dns');
const { log } = require('node:console');



// Basic Configuration
const port = process.env.PORT || 3000;
let inputShort = 1
mongoose.connect(process.env.MONGO_URL, {useNewUrlParser : true, useUnifiedTopology: true}, (err) => {
  if(err) console.log(err);
  else
    console.log("connected to database");
});

const urlSchema = new mongoose.Schema({
  original : {type : String, required: true},
  short : Number
});

let Url = mongoose.model('Url', urlSchema);


app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


app.listen(port, function () {
  console.log(`Node.js listening at.. ${port}`);
});

/* Database Connection */

let responseObject = {}
app.post('/api/shorturl', bodyParser.urlencoded({ extended: false }) , (request, response) => {
  let inputUrl = request.body['url']
  
  let urlRegex = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi)
  
  if(!inputUrl.match(urlRegex)){
    response.json({error: 'Invalid URL'})
    return
  }
    
  responseObject['original_url'] = inputUrl
  
  
  
  // Url.findOne({})
  //       .sort({short: 'desc'})
  //       .exec((error, result) => {
  //         // if(!error && result != undefined){
  //         //   inputShort = result.short + 1
  //         // }
  //         if(!error){
  //           Url.findOneAndUpdate(
  //             {original: inputUrl},
  //             {original: inputUrl, short: inputShort++},
  //             {new: true, upsert: true },
  //             (error, savedUrl)=> {
  //               if(!error){
  //                 responseObject['short_url'] = savedUrl.short
  //                 response.json(responseObject)
  //               }
  //             }
  //           )
  //         }
  // })
    Url.find({original : inputUrl}, (err, ans) => {
     // console.log(err);
     // console.log(Object.keys(ans).length === 0);
      if(Object.keys(ans).length === 0){
        Url.findOneAndUpdate(
          {original: inputUrl},
          {original: inputUrl, short: inputShort++},
          {new: true, upsert: true },
          (error, savedUrl)=> {
            if(!error){
              responseObject['short_url'] = savedUrl.short
              response.json(responseObject)
            }
          }
        )
      }else{
        responseObject["short_url"] = ans[0].short;
        response.json(responseObject);
      }
    });
     
});

app.get('/api/shorturl/:input', (request, response) => {
  let input = request.params.input
  
  Url.findOne({short: input}, (error, result) => {
    if(!error && result != undefined){
      response.redirect(result.original)
    }else{
      response.json('URL not Found')
    }
  })
})


//---------------------------------------------------------------------------------

