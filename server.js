require('dotenv').config()
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const squareConnect = require('square-connect');
var defaultClient = squareConnect.ApiClient.instance;

var oauth2 = defaultClient.authentications['oauth2'];
oauth2.accessToken = process.env.ACCESS_TOKEN;

app.set("view engine", "ejs")
app.use(express.static('static'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.all("*", function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
})

app.get('/', function (req, res){
    return res.render('home');
});


// Initialize Customers API
let squareCustomers = new squareConnect.CustomersApi();

// List all Customers
app.get('/customers', function (req, res){
    let cursor = req.query.cursor;
    let customers;
    squareCustomers.listCustomers().then(function(data){
        customers = data;
        return res.json(customers)
    }, function(error){
        return res.send('Error')
    });
})

// Paginate Through Customers
app.get('/customers/search', function(req, res){
    let cursor = req.query.cursor
    console.log(req.query.id)
    let body = new squareConnect.SearchCustomersRequest();
    body.limit = 1
    body.cursor = cursor
    body.query = {
        sort: {
            field: "DEFAULT"
        }
    };
    squareCustomers.searchCustomers(body).then(function(data){
        return res.json(data);
    }, function(error) {
        return res.send(error);
    })
})

// Retrieve Specific Customer
app.get('/customers/:id', function (req, res){
    let id = req.params.id
    squareCustomers.retrieveCustomer(id).then(function(data){
        return res.json(data);
    }, function(error){
        return res.send('Error')
    })
})

// Create Customer
app.post('/customers/create/', function (req, res){

    // get parameters from post request
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let email = req.body.email;
    let phone = req.body.phone;
    let nickname = req.body.nickname;
    let companyName = req.body.company;

    // pass parameters onto new customer
    let newCustomer = new squareConnect.CreateCustomerRequest();
    newCustomer.given_name = firstName;
    newCustomer.family_name = lastName;
    newCustomer.email_address = email;
    newCustomer.phone_number = phone;
    newCustomer.company_name = companyName;
    newCustomer.nickname = nickname;

    squareCustomers.createCustomer(newCustomer).then(function(data) {
        return res.json(data);
    }, function(error){
        return res.send(error);
    })
})

// Update Customer
app.post('/customers/update/', function(req, res){
    let squareId = req.body.squareId;
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let email = req.body.emailAddress;
    let phone = req.body.phoneNumber;
    let companyName = req.body.companyName;

    let updatedInfo = new squareConnect.UpdateCustomerRequest();
    updatedInfo.given_name = firstName;
    updatedInfo.family_name = lastName;
    updatedInfo.email_address = email;
    updatedInfo.phone_number = phone;
    updatedInfo.companyName = companyName;

    squareCustomers.updateCustomer(squareId, updatedInfo).then(function(data) {
        return res.json(data);
    }, function(error){
        return res.send(error);
    })
})

app.listen(process.env.PORT || 8000, function(){
    console.log("Server running at http://localhost:8000")
})