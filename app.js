const express = require("express")
const cors = require("cors")
const cookieSession = require("cookie-session");
const path = require('path');

var app = express();
app.use(cors({
  credentials: true,
  origin: ["http://vistaapp.s3-website-us-east-1.amazonaws.com"],
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "ehtois-session",
    secret: "favoravel_SECRET",
    httpOnly: true
  })
);

global.__basedir = __dirname;

app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://vistaapp.s3-website-us-east-1.amazonaws.com');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

require('./routes/auth.routes')(app);
require('./routes/user.routes')(app);

require('./routes/questionario.routes')(app);
require('./routes/file.routes')(app);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Servidor rodando na porta: ${port}`)
})
