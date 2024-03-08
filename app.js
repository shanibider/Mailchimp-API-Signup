// https://mailchimp.com/developer/marketing/docs/fundamentals/
// https://mailchimp.com/developer/marketing/api/ecommerce-orders/
// https://mailchimp.com/developer/marketing/api/lists/
// https://mailchimp.com/developer/marketing/guides/access-user-data-oauth-2/?_ga=2.230154139.609880322.1709910708-1755440482.1709910707

const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/signup.html");
});

// Simplified object destructuring to directly extract fName, lName, and email
app.post("/", function(req, res) {
  const { fName, lName, email } = req.body;


// will need to send JSON object.
//firstly, create javascript object. With key, value pairs that mailchimp is expecting.
const data =  {
  members: [        //array of objects
    {
      email_address: email,       // the email from the post request (the form)
      status: "subscribed",
      merge_fields: {             //from admin.mailchimp.com/lists/settings/merge-tags 
        FNAME: fName,
        LNAME: lName
      }
    }
  ]
};

  const jsonData = JSON.stringify(data);  //convert the javascript object to a JSON string, that mailchimp is expecting.

  const url = "https://us21.api.mailchimp.com/3.0/lists/9df456b62d";

  // options for my http post request 
  const options = {
    method: "POST",
    auth: "shani:f2da992f94f4a864713b69f0928132e0-us21"
  };

  // Post Request to mailchimp server (url, options above, callback function from mailchimp server)
  const mailchimpRequest = https.request(url, options, function(response) {
    let responseData = "";

    response.on("data", function(chunk) {
      responseData += chunk;
    });

    response.on("end", function() {
      const responseDataObject = JSON.parse(responseData);

      if (response.statusCode === 200) {
        res.sendFile(__dirname + "/success.html");
      } else {
        console.error("Mailchimp API Error:", responseDataObject);
        res.sendFile(__dirname + "/failure.html");
      }
    });
  });

  mailchimpRequest.on("error", function(error) {
    console.error("Mailchimp API Request Error:", error);
    res.sendFile(__dirname + "/error.html");
  });

  mailchimpRequest.write(jsonData);
  mailchimpRequest.end();
});

// post request to catch the failure route
app.post("/failure", function(req, res) {
  res.redirect("/");
});

app.listen(3000, function() {
  console.log("Server is running on port 3000");
});



//mailchinpAPI key
//f2da992f94f4a864713b69f0928132e0-us21

//List Id - Unique Audience ID for: shani -
//9df456b62d
