import express from "express"
import Routes from './routes/index.js'

const app = express();

// Settings

app.set('port', 1213)
app.set('json spaces', 4)

// middleware
app.use(express.urlencoded({extended: true}))

// routes

app.use(Routes)

app.listen(app.get('port'), () => {
    console.log("Server using port " + app.get('port'));
});
