'use strict';

// Imports dependencies and set up http server
const
    express = require('express'),
    bodyParser = require('body-parser'),
    request = require('request'),
    app = express().use(bodyParser.json()), // creates express http server
    PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

function callSendAPI(sender_psid, response) {

    // Construct the message body
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    }

    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": {
            "access_token": PAGE_ACCESS_TOKEN
        },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('message sent!')
            console.log("MESSAGE FROM BOT" +  JSON.stringify(request_body));
        } else {
            console.error("Unable to send message:" + err);
        }
    });
}

function handleMessage(sender_psid, received_message) {

    let response;

    // Check if the message contains text
    if (received_message.text) {

        request({
                "uri": 'https://icanhazdadjoke.com',
                "headers": {
                    "Accept": 'text/plain'
                }
            },
            function (error, response, body) {
                console.log("THIS HAS RUN");
                console.log('error:', error); // Print the error if one occurred
                response = {
                    "text": body
                }
                // Sends the response message
                callSendAPI(sender_psid, response);
            });

    }


}


// Creates the endpoint for our webhook 
app.post('/webhook', (req, res) => {

    let body = req.body;

    // Checks this is an event from a page subscription
    if (body.object === 'page') {

        // Iterates over each entry - there may be multiple if batched

            // Gets the message. entry.messaging is an array, but 
            // will only ever contain one message, so we get index 0
            let webhookEvent = body.entry[0].messaging[0];
           // console.log(webhookEvent);

            // Get the sender PSID
            let sender_psid = webhookEvent.sender.id;
           // console.log('Sender PSID: ' + sender_psid);


            // Check if the event is a message or postback and
            // pass the event to the appropriate handler function
            if (webhookEvent.message && sender_psid !== 2048252168522145) {
                handleMessage(sender_psid, webhookEvent.message);
            } 
       

        // Returns a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED');
    } else {
        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }

});

app.get('/', (req, res) => {
    res.send("Working");
});


// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = "super_secret"

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {

        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {

            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);

        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
});







// Sets server port and logs message on success
app.listen(process.env.PORT || 3000, () => console.log('webhook is listening'));