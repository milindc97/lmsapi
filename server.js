const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const Sentry = require('@sentry/node');
var app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
require("./agenda.js");

Sentry.init({
  dsn: "https://5b5eccc279d0422aaabbfa9428646670@o4505188561387520.ingest.sentry.io/4505188562894848",
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Sentry.Integrations.Express({ app }),
    // Automatically instrument Node.js libraries and frameworks
    ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
  ],

  tracesSampleRate: 1.0,
});


const io = new Server(server, {
  cors: {
    origin: '*',
  }
});
require('dotenv').config();
const db = require("./app/models");
const dbConfig = require("./app/config/db.config");
const devDbConfig = require("./app/config/devdb.config");
const Role = db.role;
const User = db.user;
if(process.env.environment == 'developement'){
  db.mongoose.connect(`mongodb+srv://${devDbConfig.HOST}/${devDbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connect to MongoDB to developmet");
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });

}else{
  db.mongoose.connect(`mongodb://${dbConfig.HOST}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connect to MongoDB to production");
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });
}



var corsOptions = {
  Origin: "*"
};



app.use(cors(corsOptions));
app.use(express.static('public'));
// parse requests of content-type - application/json
app.use(bodyParser.json({limit: '55mb'}));
app.use(bodyParser.urlencoded({limit: '55mb',extended: true, parameterLimit:50000 }));

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// parse requests of content-type - application/x-www-form-urlencoded
// simple route
app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
  <html>
  <head>
  <link href='https://fonts.googleapis.com/css?family=Ubuntu' rel='stylesheet'>
  <title>Page Title</title>
  <style>
  *{
  font-family: 'Ubuntu';
  }
  
  .center { 
    height: 100vh;
    position: relative; 
  }
  
  .center img {
    margin: 0;
    position: absolute;
    top: 33%;
    width:200px;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  
  .center h3 {
    margin: 0;
    position: absolute;
    top: 45%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  
  .center p {
    margin: 0;
    position: absolute;
    top: 49%;
    left: 50%;
    color:gray;
    transform: translate(-50%, -50%);
  }
  </style>
  </head>
  <body>
  <div class="center">
  <img src="https://fusionlnd.sgp1.digitaloceanspaces.com/44992.jpg">
  <h3>Access Denied</h3>
  <p>You don't have permission to access this domain</p>
  </div>
  
  </body>
  </html>
  
  
  `);
});

app.get("/pdf", async (req, res) => {
  const url = "https://fusionlnd.sgp1.digitaloceanspaces.com/44d8a26e0d6368a6c7a90cd00.pdf"; // Get the URL from the query parameter

  try {

    res.send(`<!DOCTYPE html>
    <html>
    <head>
      <title>PDF Display</title>
      <style>
        #pdfIframe {
          width: 100%;
          height: 100vh;
          border: none;
          transform-origin: 0 0;
          transition: transform 0.3s;
        }
      </style>
    </head>
    <body>
      <h1>PDF Display</h1>
      <button id="zoomInBtn">Zoom In</button>
      <button id="zoomOutBtn">Zoom Out</button>
      <iframe id="pdfIframe" src="${url}"></iframe>
    
      <script>
        const iframe = document.getElementById('pdfIframe');
        const zoomInBtn = document.getElementById('zoomInBtn');
        const zoomOutBtn = document.getElementById('zoomOutBtn');
        let zoomLevel = 1;
    
        zoomInBtn.addEventListener('click', () => {
          zoomLevel += 0.1;
          updateZoom();
        });
    
        zoomOutBtn.addEventListener('click', () => {
          zoomLevel -= 0.1;
          updateZoom();
        });
    
        function updateZoom() {
          iframe.style.transform = scale(zoomLevel);
        }
      </script>
    </body>
    </html>`);
  } catch (error) {
    console.error(error);
    res.status(500).send(`<iframe src="${url}" style="width: 100%; height: 100vh;"></iframe>`);
    
  }
});


io.on('connection', (socket) => {

  socket.on('online', (userId) => {
    User.findByIdAndUpdate(userId,{$set:{state: "Online",socket:socket.id}},(err,data) => {
      if (err) {
        console.log("error", err);
      }
    });
  });

  socket.on('disconnect', function () {
    User.findOneAndUpdate({socket:socket.id},{$set:{state: "Offline"}},(err,data) => {
      if (err) {
        console.log("error", err);
      }
    });
  });
  
});

require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app); 
require('./app/routes/questionBank.routes')(app); 
require('./app/routes/question.routes')(app); 
require('./app/routes/module.routes')(app);
require('./app/routes/courses.routes')(app);
require('./app/routes/program.routes')(app);  
require('./app/routes/comman.routes')(app); 
require('./app/routes/programAllocation.routes')(app); 
require('./app/routes/notification.routes')(app);  
require('./app/routes/quizScore.routes')(app);  
require('./app/routes/userRequests.routes')(app);  
require('./app/routes/support.routes')(app);  
require('./app/routes/policy.routes')(app);  
require('./app/routes/certificates.routes')(app);  
require('./app/routes/post.routes')(app);  
require('./app/routes/news.routes')(app);  
require('./app/routes/group.routes')(app);  
require('./app/routes/leaderboard.routes')(app);
require('./app/routes/mail.routes')(app);
require('./app/routes/programsWatch.routes')(app);
require('./app/routes/rewardPoints.routes')(app);
require('./app/routes/training-glimpse.routes')(app);
require('./app/routes/redeemItems.routes')(app);
require('./app/routes/ceo.routes')(app);
require('./app/routes/redeemReward.routes')(app);
require('./app/routes/allocation.routes')(app);

app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});

app.use(Sentry.Handlers.errorHandler());

// set port, listen for requests
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
