const Router = require('express').Router;
const router = new Router();
const VoiceResponse = require('twilio').twiml.VoiceResponse;
var colors = require('colors');
const { response } = require('express');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);

let callSid, paymentSid;

router.post("/status-callback", async (request, response) => {

    console.log(`_____________________________________________________________________`.green)
    console.log(`status-callback: ${request.query.source} \n`.green)

    if (request.query.source === "update") {
        let currentlyUpdatingField; 

        switch (request.body.Capture) {
            case 'payment-card-number': 
                currentlyUpdatingField = request.body.PaymentCardNumber;
                break;
            case 'security-code':
                currentlyUpdatingField = request.body.SecurityCode;
                break;
            case 'postal-code': 
                currentlyUpdatingField = request.body.PaymentCardPostalCode;
                break;
            case 'expiration-date':
                currentlyUpdatingField = request.body.ExpirationDate;
                break;
            default: 
                currentlyUpdatingField = null;
        }

        if (request.body.PartialResult) {
            console.log(`Customer is entering ${request.body.Capture}: ${currentlyUpdatingField}`)
        } else if (request.body.ErrorType) {
            console.log(`Error when entering ${request.body.Capture}. Error Type: ${request.body.ErrorType}.`.bgRed)
        } else {
            console.log(`Customer finished entering ${request.body.Capture}. Fields still needed: ${request.body.Required || 'none'}`)
        }
    }

    if (request.query.source === "complete") {
        console.log(`Payment Complete: `.rainbow)
        console.log(request.body)
    }

    console.log(`_____________________________________________________________________`.green)

    response.end();
})

router.post("/start-pay-session", async (request, response) => {
    console.log(`_____________________________________________________________________`.yellow)
    console.log(`start-pay-session \n`.yellow)
  
    const payment = await client.calls(callSid)
        .payments
        .create({
            chargeAmount: request.query.paymentAmount,
            paymentConnector: 'My_Pay_Connector',
            paymentMethod: request.query.paymentMethod, 
            idempotencyKey: callSid, 
            statusCallback: `https://bdelvalle.ngrok.io/status-callback?source=start`
        });

    paymentSid = payment.sid

    console.log(`Payment Started! Payment Sid: ${paymentSid}`.yellow)
    console.log(`_____________________________________________________________________`.yellow)


    response.status(200).send({ paymentSid: payment.sid });
});

router.post("/update-pay-session", async (request, response) => {
    console.log(`_____________________________________________________________________`.green)
    console.log(`update-pay-session \n`.green.bgBlack)

    const result = await client.calls(callSid)
        .payments(paymentSid)
        .update({
            capture: request.query.paymentStep,
            idempotencyKey: callSid,
            statusCallback: `https://bdelvalle.ngrok.io/status-callback?source=update`
        });

    console.log(`Pay Session Updated, ready to collect ${request.query.paymentStep}`.green)
    // console.log(result);

    console.log(`_____________________________________________________________________`.green)


    response.status(200).send(`Pay Session Updated, ready to collect ${request.query.paymentStep}`)
})

router.post("/complete-pay-session", async (request, response) => {

    console.log(`_____________________________________________________________________`.cyan)
    console.log('complete-pay-session \n'.cyan)

    
    try {
        await client.calls(callSid)
            .payments(paymentSid)
            .update({
                status: 'complete',
                idempotencyKey: callSid,
                statusCallback: `https://bdelvalle.ngrok.io/status-callback?source=complete`
            });

        console.log(`Payment Complete!`.cyan)

        response.send(`Payment Complete!`)
    } catch (error) {
        console.log(`Error! Not all of the payment information was collected!`.bgRed)
        response.send(`Error! ${error.message}`)
    }
       
    console.log(`_____________________________________________________________________`.cyan)
    
})

router.post("/twiml", (request, response) => {
    response.type('xml');

    // TODO MOVE CALLER ID TO .ENV?

    const twiml = new VoiceResponse();
    const dial = twiml.dial({
        callerId: '+19789612713',
        record: 'record-from-answer-dual', 
        recordingStatusCallback: 'https://bdelvalle.ngrok.io/recording-status-callback'
    });
    dial.number({
        statusCallbackEvent: 'answered',
        statusCallback: 'https://bdelvalle.ngrok.io/dial-status-callback'
    },'+17204601666')
    
    response.send(twiml.toString());

});

router.post('/recording-status-callback', (request, response) => {
    console.log(`_____________________________________________________________________`.blue)
    console.log('Recording Status Callback \n'.blue)
    console.log(`Recording URL: ${request.body.RecordingUrl}.mp3`);
 
    console.log(`_____________________________________________________________________`.blue)    
    response.send()
})

router.post("/dial-status-callback", async (request, response) => {
    callSid = request.body.ParentCallSid;
    response.send();
})

module.exports = router;
