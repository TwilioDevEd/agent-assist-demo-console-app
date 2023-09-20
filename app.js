var inquirer = require('inquirer');
var colors = require('colors');
const fetch = require('node-fetch')
require('dotenv').config();

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const baseUrl = `${process.env.YOUR_NGROK_DOMAIN}`;
const client = require('twilio')(accountSid, authToken);
const paymentConnector = process.env.YOUR_PAYMENT_CONNECTOR_NAME;

const line = "_____________________________________________________________________";

exports.startApplication = async function startApplication() {

  var lines = process.stdout.getWindowSize()[1];
  for(var i = 0; i < lines; i++) {
      console.log('\r\n');
  }

  console.log(`${line}`.rainbow)
  console.log(`\nHave the customer call the agent at: ${process.env.YOUR_TWILIO_NUMBER}`);
  console.log(`${line}\n`.rainbow)
}



exports.getPaymentAmount = async function getPaymentAmount() {
   const { paymentAmount } = await inquirer.prompt({
        type: 'input', 
        name: 'paymentAmount', 
        message: 'Enter the payment amount and hit enter.',
        default: 0
      })

    return paymentAmount;
}


exports.startPaySession = async function startPaySession(paymentAmount, callSid) {
    console.log(`${line}`.yellow)
    console.log(`\nInside stardPaySession function.`.yellow)
    console.log(`This is where we use the Payment Resource to start a payment session`.yellow)

    if (!callSid) {
        console.log(`${line}`.red);
        console.log(`\nNo active call found. Closing application. Make sure you start this program BEFORE calling the agent.`.red)
        console.log(`Restart with command: npm run start`.red)
        console.log(`${line}`.red);
        process.exit(0)
    }

    console.log(`Attempting to create a new Pay Session ...`)
    // This is you how start a Payment Session with the Payment Resource
    const payment = await client.calls(callSid)
        .payments
        .create({
            chargeAmount: paymentAmount,
            paymentConnector: paymentConnector,
            paymentMethod: 'credit-card', 
            idempotencyKey: callSid, 
            statusCallback: `${baseUrl}/start-status-callback`
        });

    paymentSid = payment.sid

    console.log(`\nPayment Started! Payment Sid: ${paymentSid}`)
    
    console.log(`${line}`.yellow)

    return;
}

exports.updatePaySession = async function updatePaySession(paymentStep, callSid) {
    console.log(`${line}`.magenta)
    console.log(`\nInside updatePaySession function\n`)

    // This is how you update a Payment Session with the Payment Resource 
    // You "update" when you are ready for a specific payment step (like "payment-card-number" or "security-code")
    await client.calls(callSid)
        .payments(paymentSid)
        .update({
            capture: paymentStep,
            idempotencyKey: callSid,
            statusCallback: `${baseUrl}/update-status-callback`
        });

    console.log(`Pay Session Updated, ready to capture ${paymentStep}`)
    console.log(`${line}`.magenta)
    return;
}

exports.completePaySession = async function completePaySession(callSid, paymentSid) {
    console.log(`${line}`.cyan)
    console.log('Inside completePaySession function')
    
    try {
        // This is how we complete a Payment Session using the Payment Resource
        await client.calls(callSid)
            .payments(paymentSid)
            .update({
                status: 'complete',
                idempotencyKey: callSid,
                statusCallback: `${baseUrl}/complete-status-callback`
            });
        console.log(`Payment Complete!`)
        console.log(`${line}`.cyan)
    } catch (error) {
        console.error(error)
        process.exit(0);
    }  
    return;
}

