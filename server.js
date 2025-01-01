const bodyParser = require("body-parser");
const express = require("express");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const restaurantRoutes = require("./routes/restaurantRoute");
const menuRoutes = require("./routes/MenuRoute");
const passport = require("passport");
const cors = require("cors");
const Users = require("./models/Users");
const LocalStrategy = require("passport-local").Strategy;
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const session = require("express-session");

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());

dotenv.config();

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("connected to db");
    }).catch((err) => {
        console.log(err);
    });

app.use(session({
    secret: "abcd1234",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({mongoUrl: process.env.MONGODB_URI}),
    cookie: {
        maxAge: 1000 * 60*60*24*7
    }
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(Users.authenticate()));
passport.serializeUser(Users.serializeUser());
passport.deserializeUser(Users.deserializeUser());

app.get("/", (req, res) => {
    return res.json("Hello")
})

app.use("/user", userRoutes);
app.use("/admin", adminRoutes);
app.use("/restaurant", restaurantRoutes);
app.use("/menu", menuRoutes);
// app.use("/rider", riderRoutes);

app.listen(5000, () => {    
    console.log("serve on http://localhost:5000");
})