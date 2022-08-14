require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dns = require('node:dns');
const console = require('console');
const URL = require('node:url').URL;
var somenum = Math.floor(Math.random() * 300);
// Basic Configuration
const port = process.env.PORT || 3000;

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

let responseObject = {};
app.post('/api/shorturl', bodyParser.urlencoded({ extended: false }) , (request, response) => {
  let inputUrl = request.body['url'];
  const options = {
    family: 6,
    hints: dns.ADDRCONFIG | dns.V4MAPPED,
  };

  responseObject['original_url'] = inputUrl;

      // const httpRegex = /^(http|https)(:\/\/)/; 
      // if (!httpRegex.test(inputUrl)) {
      // res.json({ error: 'invalid url' });
      // return;
      // }

      try {
        const hostUrl = new URL(inputUrl);

        //check for valid host name;
        dns.lookup(hostUrl.hostname, options, (err, addrs, family) => {


           // response.send({hostname : hostUrl.hostname, error : err, address : addrs, fam : family});


            if(err){
              response.json({"error":"Invalid Hostname"});
            }else{
              Url.find({original : inputUrl}, (err, ans) => {
                //console.log(err);
               // console.log(Object.keys(ans).length === 0);
               
               let inputShort = (Date.now()+somenum);
                if(Object.keys(ans).length === 0){
                  Url.findOneAndUpdate(
                    {original: inputUrl},
                    {original: inputUrl, short: inputShort},
                    {new: true, upsert: true },
                    (error, savedUrl)=> {
                      if(!error){
                        responseObject['short_url'] = savedUrl.short
                        response.json(responseObject)
                      }
                    }
                  )
                  
                  //console.log(inputShort);
                }else{
                  responseObject["short_url"] = ans[0].short;
                  response.json(responseObject);
                }
              });

            }
        });
      } catch (err) {
        //response.json({ "error": 'invalid url' });
        response.json( {error:"Invalid URL"} );
      }
});

app.get('/api/shorturl/:input', (request, response) => {
  let input = request.params.input;
  
  Url.findOne({short: input}, (error, result) => {
    if(!error && result != undefined){
      response.redirect(result.original);
    }else{
      response.send('URL not Found');
    }
  })
})


//---------------------------------------------------------------------------------

