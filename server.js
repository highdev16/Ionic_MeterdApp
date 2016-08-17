var express = require('express'),
app = express();

var Firebase = require("firebase");
var ref = new Firebase("https://meterd.firebaseio.com/");

var bodyParser = require('body-parser');
var stripe = require("stripe")("sk_test_TtUOFOUfSYJqEaDdpOAFxq2t");
//var stripe = require("stripe")("pk_test_3XRcbuhJG1R1ykdm1ZEKtcGX");

app.use(express.static('www'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

var jsonParser = bodyParser.json();

// CORS (Cross-Origin Resource Sharing) headers to support Cross-site HTTP requests
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,X-Requested-With");
    next();
});

// API Routes
app.post('/stripe/add', jsonParser, function(req, res) {
    if (!req) {
        return res.sendStatus(400);
    }
    console.log(req.body);
    stripe.customers.create({
    	source: req.body.id,
        email: req.body.email
    }).then(function(customer) {
    	ref.child("users").child(req.body.uid).update({
    		'customer' : customer
    	});
	    console.log("adding customer: "+customer.id);
    });
});

app.post('/stripe/charge', jsonParser, function(req, res) {
    // if (!req) {
    //     return res.sendStatus(400);
    // }

    // var ref = new Firebase("https://meterd.firebaseio.com");
    // var authData = ref.getAuth();
    // console.log(authData);
    // var loggedInUserRef = new Firebase(ref + "/users/" + authData.uid);
    // loggedInUserRef.once("value", function(snapshot){
    // var data = snapshot.exportVal();
    // console.log(data);


    var amount = parseInt(Math.max(req.body.amount, 50));
    console.log("charging ", amount);

    stripe.charges.create({

    	// amount: data.amount,
    	// currency: "usd",
    	// customer: data.customer.id
      source: req.body.id,
    //  email: req.body.email,
      amount: amount,
      currency: "usd",
  //    customer: req.body.id

  });
    // console.log("charging: "+req.body.id);
  return res.sendStatus(200);
  

});

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});


// app.use(express.static(__dirname));
// app.listen(process.env.PORT || 3000);
