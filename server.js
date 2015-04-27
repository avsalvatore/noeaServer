var express = require('express');
var bodyParser = require('body-parser');
var validator = require('validator');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/nodemongoexample';
var MongoClient = require('mongodb').MongoClient, format = require('util').format;
var db = MongoClient.connect(mongoUri, function(error, databaseConnection) {
	db = databaseConnection;
});

//finds restaurants within a certain lat/lng range of given range
app.get('/findRestaurants', function(request, response) {
	  response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "X-Requested-With");
	  response.set('Content-Type', 'text/html');

	var mylat = request.query.mylat;
	var mylng = request.query.mylng;
	var range = reuqest.query.range / 2;

	db.collection('restaurants', function (err, coll) {
		if (err) {
			response.send({});
		} else {
			coll.find({lat: {$gt: mylat - range, $lt: mylat - range}, lng: {$gt: mylng - range, mylng + range}}).toArray(
  				function(error2, docs) {
  					if (error2) {
  						response.send({});
  					} else if (docs.length > 0) {
  						response.send(docs);
  					} else {
  						response.send({});
  					}
				});
			});
		}
	});
});

//finds past and future 'NOEAs' based on login id
app.get('/findnoas', function(request, response){
	response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "X-Requested-With");
  	var login = request.query.login;
  
  	if (login == null) {
  		response.send({});
  	} else {
  		db.collection('noeas', function(error1, coll) {
  			coll.find({'user_id': login}).toArray(
  				function(error2, docs) {
  					if (error2) {
  						response.send({});
  					} else if (docs.length > 0) {
  						response.send(docs);
  					} else {
  					response.send({});
  				}
  			})
  		});
  	}
});


app.listen(app.get('port'), function() {
  console.log("NOEA app is running at localhost:" + app.get('port'));
});