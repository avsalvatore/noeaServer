var express = require('express');
var bodyParser = require('body-parser');
var validator = require('validator');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/nodemongoexample';
var MongoClient = require('mongodb').MongoClient, format = require('util').format;
var db = MongoClient.connect(mongoUri, function(error, databaseConnection) {
	db = databaseConnection;
});

app.set('port', (process.env.PORT || 5000));

//restaurants in DB only required to have name and zip
app.post('/addrestaurant', function(request, response) {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "X-Requested-With");

    var restname = request.body.restname;
    var zip = request.body.zip;
    var foodtype = request.body.foodtype;
    var website = request.body.website;

    var toInsert = {
      "restname": restname, 
      "zip": zip, 
      "foodtype": foodtype, 
      "website": website,
    };
    //should CLEAN UP data MORE to MAKE more SECURE
    if (restname == null || zip == null) {
      response.send({"error": "Whoops, something is wrong with your data!"});
    }

    db.collection('restaurants', function(error, coll) {
      if (error) {
        response.send(400);
      } else {
        coll.find({"restname": restname, "zip": zip}).toArray(function (error1, data) {
            if (error1) {
              response.send(400);
            } else if (data.length > 0) {
                coll.update({"restname": restname, "zip":zip}, {$set: {"foodtype": foodtype, 
                      "website": website}}, 
                      function (error2, result) {
                        if (error2) {
                          response.send(400);
                        } else {
                          coll.find({}).toArray(
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
                  coll.find({}).toArray(function (error3, docs) {
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

	var myZip = request.query.zip;

  if (myZip == null) {
    response.send({});
  } else {
	   db.collection('restaurants', function (err, coll) {
		    if (err) {
			     response.send(400);
		    } else {
			     coll.find({'zip': myZip}).toArray(function(error2, docs) {
  					   if (error2) {
  						    response.send(400);
  					   } else if (docs.length > 0) {
  						    response.send(docs);
  					   } else {
  						    response.send(400);
  					   }
			     });
		    }
	   });
  }
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
                indexPage += "<p>" + docs[count]._tid + 
                  ' named ' + docs[count].restname +
                  ' at zip ' + docs[count].zip +
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