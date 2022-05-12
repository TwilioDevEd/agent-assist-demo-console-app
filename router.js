const Router = require('express').Router;
const router = new Router();
const VoiceResponse = require('twilio').twiml.VoiceResponse;
var colors = require('colors');
require('dotenv').config();
const agentPhoneNumber = process.env.AGENT_PHONE_NUMBER;
const {
    updatePaySession, 
    completePaySession, 
    getPaymentAmount, 
    startPaySession
} = require('./app');

let callSid, paymentSid;

const line = "_____________________________________________________________________";

router.post("/start-status-callback", async (request, response) => {
    paymentSid = request.body.Sid;    
    // console.log('\n'.bgBlue);
    // console.log("\nInside /start-status-callback endpoint".bgBlue);
    // console.log(request.body);
    // console.log('\n'.bgBlue);
    response.end();
})

router.post("/complete-status-callback", async (request, response) => {

    console.log(`${line}`.rainbow)
   
    console.log("\nInside /complete-status-callback endpoint")
    console.log(`Payment Complete!\n`)
    console.log(request.body)

    console.log(`${line}`.rainbow)
    response.end();
    process.exit(0);

})

function getCurrentCustomerInput(requestBody) {
    switch (requestBody.Capture) {
        case 'payment-card-number': 
            return requestBody.PaymentCardNumber;
        case 'security-code':
            return requestBody.SecurityCode;
        case 'postal-code': 
            return requestBody.PaymentCardPostalCode;
        case 'expiration-date':
            return requestBody.ExpirationDate;
        default: 
            return null;
    }
}

router.post("/update-status-callback", async (request, response) => {
    console.log(`${line}`.green);
    console.log("\nInside /update-status-callback endpoint\n")

    // PartialResult means that a customer is entering a field and it has
    // not been filled in all the way yet
    if (request.body.PartialResult) {
            const currentCustomerInput = getCurrentCustomerInput(request.body)      
            console.log(`Customer is entering ${request.body.Capture}: ${currentCustomerInput}`)

    // If there's an error, we'll retry capturing that payment step's information again. 
    // We use the /update-pay-session endpoint, which will update the Payment Resource to let it know
    // we want to try capturing that information again. 
    } else if (request.body.ErrorType) {
        console.log(`${line}`.red);
        console.log(`Error when entering ${request.body.Capture}. Error Type: ${request.body.ErrorType}.\n`)
        console.log(`${line}`.red);

        await updatePaySession(request.body.Capture, callSid);    
    } else {
        let message = `\nCustomer finished entering ${request.body.Capture}.\n`

        if (request.body.Required) {
            const stillNeededFields = request.body.Required.split(',');
            console.log(`${message}Will capture ${stillNeededFields[0]} next ...`)
            console.log(`${line}`.green);
            await updatePaySession(stillNeededFields[0], callSid)
        } else {
            message += `All fields have been captured. Completing Pay Session ...`;
            console.log(`${message}`)
            console.log(`${line}`.green);
            await completePaySession(callSid, paymentSid) 
        }
    }

    response.end();
})

// This closes the program in the event that one of the callers hangs up. 
router.post('/end-call', (request,response) => {
    console.log(`Call ended. Closing application. Restart with command: npm run start`);
    response.send();
    process.exit(0);
})

// We have a Twilio phone number configured to point to this endpoint
// This TwiML dials our "agent"
router.post("/twiml", (request, response) => {
    response.type('xml');

    // TODO MOVE CALLER ID TO .ENV?

    const twiml = new VoiceResponse();
    const dial = twiml.dial({
        callerId: agentPhoneNumber,
        action: '/end-call',
        record: 'record-from-answer-dual', 
    });
    dial.number({
        statusCallbackEvent: 'answered',
        statusCallback: `/dial-status-callback`
    }, agentPhoneNumber)
    response.send(twiml.toString());
});

// Here, we grab the parent Call SID and use it when we start the
// Payment session. The parent call is the leg in which the customer dialed 
// our Twilio number (our "agent");
router.post("/dial-status-callback", async (request, response) => {
    callSid = request.body.ParentCallSid;
    const paymentAmount = await getPaymentAmount();
    await startPaySession(paymentAmount, callSid);
    await updatePaySession('payment-card-number', callSid);
    response.send();
})

module.exports = router;
