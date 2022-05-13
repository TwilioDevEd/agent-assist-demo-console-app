# Agent Assisted Pay - Demo Console App

This is a Node.js console application, which is intended to illustrate how a user can interact with the [Payment Resource](https://www.twilio.com/docs/voice/api/payment-resource) in order to facilitate agent-assisted payments over the phone. 

## Prerequisites 
You must have installed the following tools:
- Ngrok 

You must have an installed Pay Connector and a staging or mock payment processor. You can work through [this Generic Pay Connector Tutorial](https://www.twilio.com/docs/voice/tutorials/how-to-capture-payment-during-a-voice-call-generic-pay-connector) to set up both of these things.

## Not technically needed but nice to have

Part of understanding how a payment session works is hearing the audio for both parties in a call. Since most of us have one cell phone, we can use the [Twilio Dev-Phone](https://www.twilio.com/docs/labs/dev-phone) as a browser-based phone who will be our "agent". (Make sure you buy a new phone number and call it "Dev Phone" that you can always use with the Dev Phone). 

## Setup

### Start your Ngrok Tunnel
Open up a terminal and start your ngrok tunnel for port 3000. If you have a custom domain, the command will be: `ngrok http --region=us --hostname=mydemotunnel.ngrok.io 3000`otherwise, the command will be `ngrok http --region=us 3000`. Leave this terminal open and running! 

### Buy and Configure a Twilio Phone Number
1. Buy a Twilio Phone Number and give it a friendly name like `My Agent Assist Demo Number`. This is the phone number your "customer" will call. 
1. On the Phone Number's configuration page, for "When a call comes in" select "Webhook" and `https://` + your ngrok tunnel domain + `/twiml` (ex: `https://briannastunnel.ngrok.io/twiml`). 

This demo application has a `/twiml` endpoint that will return TwiML to Twilio. It tells Twilio to `<Dial>` the phone number of your "agent". In this case, that can be your Twilio Dev Phone's phone number, or it could also just be a coworker's cell phone, your home's landline phone number, another cell phone you have, etc. 

### Run your Twilio Dev Phone (optional)
If you're using the Twilio Dev Phone, open a NEW terminal window and start the dev phone: `twilio dev-phone`. Leave this terminal open and running!

### Clone the Repo and Install Dependencies

1. Open yet another terminal window and navigate to where you want to install the repository. 
1. Clone this repo: `git clone https://github.com/TwilioDevEd/agent-assist-demo-console-app.git`
1. Change directories into the root of the project: `cd agent-assist-demo-console-app`
1. Install the dependencies: `npm install`
1. Copy the `.env.example` file to make a `.env` file: `cp .env.example .env`. 
1. Open the `.env` file in your text/code editor. (You may be able to use the command `open .env`. If you have VS Code and the `code` command configured, you could also use the command `code .env`)
1. Fill in the information in the `.env` file and SAVE your changes. 
  - `ACCOUNT_SID`: This is found on the dashboard of your Twilio Console
  - `AUTH_TOKEN`: This is also found on the dashboard of your Twilio Console
  - `AGENT_PHONE_NUMBER`: This is the number for the cell phone/landline/Twilio Dev Phone that will serve as your "agent". This isn't the number your customer will dial, but rather is the number that Twilio will `<Dial>` when your `My Agent Assist Demo Number` Twilio Phone Number recieves a call.
  - `YOUR_NGROK_DOMAIN`: The domain of your ngrok tunnel. Something like `mytunnel.ngrok.io` or `123124aaaaaf.ngrok.io`. (Don't add `https:` or any slashes.)
  - `YOUR_PAYMENT_CONNECTOR_NAME`: This is the Friendly Name of the Pay Connector you will use for this demo. 
  - `YOUR_TWILIO_NUMBER`: This is the phone number your "customer" will call. This is the phone number you bought earlier and named `My Agent Assist Demo Number`. 

## Run the application

Make sure you have:
1. Your ngrok tunnel running on port 3000
1. Your `My Agent Assist Demo Number` phone number is configured to use the ngrok domain from step 1 (with `/twiml` appended on the end) when a call comes in. 
1. Have your Twilio Dev Phone running (if applicable).
1. Open a new terminal window, navigate to the root of the project (in the same directory as the `package.json` file), and run the following command: `npm run start`.

## Stop the application

You can enter `ctrl + c` to stop the application. 