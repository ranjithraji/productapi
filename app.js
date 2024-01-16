const express = require('express');
const logger = require('morgan')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()

app.use(logger('combined'))

app.use(cors())

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyParser.json())

app.get('/', (req, res) => {
    return res.json({
        message: 'Hello! Welcome to Product Api.',
    })
})

const v1 = require('./router/v1');
const { CONFIG } = require('./config/config');
app.use('/api', v1);


// mongoose.Promise = global.Promise;

// Connecting to the database
var options = {
    useNewUrlParser: true
};

const url = CONFIG.db_uri;

mongoose.connect(url, options).then(() => {
    console.log(`Connect database at MONGODB_URI : ${url}`);
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});


const PORT = CONFIG.port || 2000;

app.listen(PORT, async () => {
    console.log(`Server is listening to port ${PORT}!.`);
});