require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const squareConnect = require("square-connect");
var defaultClient = squareConnect.ApiClient.instance;

var oauth2 = defaultClient.authentications["oauth2"];
oauth2.accessToken = process.env.ACCESS_TOKEN;

app.set("view engine", "ejs");
app.use(express.static("static"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.all("*", function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header(
		"Access-Control-Allow-Methods",
		"PUT, GET, POST, DELETE, OPTIONS"
	);
	res.header("Access-Control-Allow-Headers", "Content-Type");
	next();
});

app.get("/", function (req, res) {
	return res.render("home");
});

// Initialize Customers API
let squareCustomers = new squareConnect.CustomersApi();

// List all Customers
app.get("/customers", function (req, res) {
	let cursor = req.query.cursor;
	let customers;
	squareCustomers.listCustomers().then(
		function (data) {
			customers = data;
			return res.json(customers);
		},
		function (error) {
			return res.send("Error");
		}
	);
});

// Paginate Through Customers
app.get("/customers/search", function (req, res) {
	let cursor = req.query.cursor;
	const body = new squareConnect.SearchCustomersRequest();
	body.limit = 100;
	body.cursor = cursor;
	body.query = {
		sort: {
			field: "DEFAULT",
		},
	};
	const customerList = [];
	const fetchCustomers = (b) => {
		return squareCustomers.searchCustomers(b).then((result) => {
			if (Array.isArray(result.customers)) {
				for (const cust of result.customers) {
					customerList.push(cust);
				}
			}
			if (result.cursor) {
				const newBody = { ...b };
				newBody.cursor = result.cursor;
				return fetchCustomers(newBody);
			}
			return { customers: customerList };
		});
	};
	return fetchCustomers(body)
		.then((data) => {
			return res.json(data);
		})
		.catch((err) => {
			res.send(err);
		});
});

// Retrieve Specific Customer
app.get("/customers/id/:id", function (req, res) {
	let id = req.params.id;
	squareCustomers.retrieveCustomer(id).then(
		function (data) {
			return res.json(data);
		},
		function (error) {
			return res.send("Error");
		}
	);
});

// Create Customer
app.post("/customers/create/", function (req, res) {
	// get parameters from post request
	let firstName = req.body.firstName;
	let lastName = req.body.lastName;
	let email = req.body.email;
	let phone = req.body.phone;
	let nickname = req.body.nickname;
	let companyName = req.body.company;
	let note = req.body.note;
	let birthday = req.body.birthday;
	let address = {
		address_line_1: req.body.addressLine1,
		address_line_2: req.body.addressLine2,
		address_line_3: req.body.addressLine3,
		locality: req.body.city,
		administrative_district_level_1: req.body.state,
		postal_code: req.body.zipCode,
		country: "US",
	};

	// pass parameters onto new customer
	let newCustomer = new squareConnect.CreateCustomerRequest();
	newCustomer.given_name = firstName;
	newCustomer.family_name = lastName;
	newCustomer.email_address = email;
	newCustomer.phone_number = phone;
	newCustomer.company_name = companyName;
	newCustomer.nickname = nickname;
	newCustomer.address = address;
	newCustomer.note = note;
	newCustomer.birthday = birthday;

	squareCustomers.createCustomer(newCustomer).then(
		function (data) {
			console.log(data);
			return res.json(data);
		},
		function (error) {
			console.log(error);
			return res.send(error);
		}
	);
});

// Update Customer
app.post("/customers/update/", function (req, res) {
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

	squareCustomers.updateCustomer(squareId, updatedInfo).then(
		function (data) {
			return res.json(data);
		},
		function (error) {
			return res.send(error);
		}
	);
});

app.listen(process.env.PORT || 8000, function () {
	console.log("Server running at http://localhost:8000");
});
