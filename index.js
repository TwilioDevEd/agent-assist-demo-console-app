const http = require('http');
const path = require('path');
const express = require('express');
const router = require('./router');

// Create Express webapp
const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.use(router);

// Create http server and run it
const server = http.createServer(app);
const port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log("Express server running on *:" + port);
});