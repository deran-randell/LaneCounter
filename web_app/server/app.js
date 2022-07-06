var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require("cors");

const indexRouter = require('./routes/index');
const configRouter = require('./routes/laneConfig');
const laneDetailRouter = require('./routes/laneDetail');
const laneDetailUpdateRouter = require('./routes/laneDetailUpdate');
const laneDetailHistoryRouter = require('./routes/laneHistory');
const dashboardRouter = require('./routes/dashboard');
const laneOverviewRouter = require('./routes/laneOverview');
const laneDeviceRouter = require('./routes/laneDevice');

const mqttClient = require('./services/mqttClient');

var app = express();

app.set('view engine', 'jade');

const whitelist = ["http://localhost:3000", "http://localhost:3001"]
const corsOptions = {
  origin:true,
  credentials: true,
}

app.use(cors(corsOptions))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'build')));

app.use('/', indexRouter);
app.use('/dashboard', dashboardRouter);
app.use('/config', configRouter);
app.use('/laneDetail', laneDetailRouter);
app.use('/laneDetailUpdate', laneDetailUpdateRouter);
app.use('/laneDetailHistory', laneDetailHistoryRouter);
app.use('/laneOverview', laneOverviewRouter);
app.use('/laneDevice', laneDeviceRouter);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(err.message, err.stack);
  res.status(statusCode).json({'message': err.message});
  
  return;
})

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

process.on('uncaughtException', err => {
  console.error('There was an uncaught error', err)
  process.exit(1) //mandatory (as per the Node.js docs)
})

module.exports = app;
