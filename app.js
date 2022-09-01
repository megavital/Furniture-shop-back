import express from "express"
import Routes from './routes/index.js'
import cookieParser from 'cookie-parser';

const app = express();

// Settings

app.set('port', 1111)
app.set('json spaces', 4)
// middleware
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(cookieParser());
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', '*');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)

    // Pass to next layer of middleware
    next();
});
// routes

app.use(Routes)

app.listen(app.get('port'), () => {
    console.log("Server using port " + app.get('port'));
});