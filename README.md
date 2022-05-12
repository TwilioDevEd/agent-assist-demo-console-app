- You must have: 
  - installed the Generic Pay Connector Add on (or have some sort of working staging payment processor) + a mock payment processor (see tutorial)
  - Node
  - Ngrok

-Nice to have
  - Twilio CLI installed
  - Twilio dev-phone plugin installed
  - Twilio dev-phone plugin configured with its own phone number (this will be your "agent" phone number) --- buy a phone number first before using it ... name it "Dev Phone"

- Buy two phone numbers
  - Name one "The number the customer calls"
    - configure it to point to your ngrok tunnel/twiml (which will dial another number for your "agent")
  - The other phone number will be your "agent" ... can use the Twilio dev-phone for this!


- Clone this repo: git clone
- open up the repo in a code editor (probably VS Code)
- run npm install in terminal ... this installs the dependencies

- Rename your .env.example file to .env
  - Fill in the info! 
  - You can start an ngrok tunnel on port 3000 and use that domain (ex: mydomain.ngrok.io) in your .env file. Even better if you have your own custom domain. 


- Have your dev phone running (if that's what you're using)
- Make sure you've filled out the .env file and saved it

- from the root of the repo/directory (the folder that has all of the files in it) in your terminal, run: npm run start
