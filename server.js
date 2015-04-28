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

app.set('port', (process.env.PORT || 5000));

app.post('/addrestaurant', function(request, response) {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "X-Requested-With");

    var name = request.body.name;
    var zip = request.body.zip;
    var foodtype = request.body.foodtype;
    var website = request.body.website;

    var toInsert = {
      "name": name, 
      "zip": zip, 
      "foodtype": foodtype, 
      "website": website,
    };
    //should CLEAN UP data MORE to MAKE more SECURE
    if (name == null || zip == null) {
      response.send({"error": "Whoops, something is wrong with your data!"});
    }

    db.collection('restaurants', function(error, coll) {
      if (error) {
        response.send(400);
      } else {
        coll.find({"name": name, "zip": zip}).toArray(function (error1, coll) {
            if (error1) {
              response.send(400);
            } else if (docs.length > 0) {
                coll.update({"name": name, "zip":zip}, {$set: {"foodtype": foodtype, 
                      "website": website}}, 
                      function (error2, result) {
                        if (error2) {
                          response.send(400);
                        } else {
                          result.find({}).toArray(
                            function (error3, docs) {
                              if (error3) {
                                response.send(400);
                              } else {
                                response.send(docs);
                              }
                            });
                        }
                      });
            } else {
              coll.insert(toInsert, function(error4, result) {
                if (error4) {
                  response.send(400);
                } else {
                  result.find({}).toArray(function (error3, docs) {
                    if (error3) {
                      response.send(400);
                    } else {
                      response.send(docs);
                    }
                  });
                }
              });
            }
        });
      }
    });


})
//finds restaurants within a certain lat/lng range of given range
app.get('/findRestaurants', function(request, response) {
	  response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "X-Requested-With");
	  response.set('Content-Type', 'text/html');

	var myZip = response.body.zip;
///change to zipppp
	db.collection('restaurants', function (err, coll) {
		if (err) {
			response.send({});
		} else {
			coll.find({'zip': myZip}).toArray(
  				function(error2, docs) {
  					if (error2) {
  						response.send({});
  					} else if (docs.length > 0) {
  						response.send(docs);
  					} else {
  						response.send({});
  					}
			});
		}
	});
});

//finds past and future 'NOEAs' based on login id
//change this to pull guest noes too!!!!
app.get('/findnoeas', function(request, response){
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
  			});
  		});
  	}
});


app.get('/', function(request, response) {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "X-Requested-With");
    response.set('Content-Type', 'text/html');
    var indexPage = "";

    db.collection('restaurants', function (error, coll) {
      coll.find().toArray(
          function(error2, docs) {
            if(error2) {
              response.send('<!DOCTYPE HTML><html><head>' +
              '<title>ALL YO DATA</title>' +
              '</head><body>' +
              '<h1>Whoops, something went terribly wrong!</h1>'
              + '</body></html>');
            } else {
              indexPage += '<!DOCTYPE HTML><html><head>' +
              '<title>ALL YO DATA</title>' +
              '</head><body>' +
              '<h1>Restaurants</h1>';
              for (var count = 0; count < docs.length; count++) {
                indexPage += "<p>" + docs[count].restid + 
                  ' named ' + docs[count].name +
                  ' at latititude ' + docs[count].lat +
                  ' and longitute ' + docs[count].lng +
                  ' serves ' + docs[count].foodtype +
                  ' find them here: ' + docs[count].website
                  '</p>';
              }
              indexPage += '</body></html>';
              response.send(indexPage);
            }
          });
    });
})

app.listen(app.get('port'), function() {
  console.log("NOEA app is running at localhost:" + app.get('port'));
});