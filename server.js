const bodyParser = require("body-parser");
const express = require("express");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const restaurantRoutes = require("./routes/restaurantRoute");
const otpRoutes = require("./routes/otpRoutes");
const menuRoutes = require("./routes/MenuRoute");
const paymentRoutes = require("./routes/paymentRoutes");
const zestyMartRoutes = require("./routes/zestyMartRoutes");
const couponRoutes = require("./routes/couponRoutes");
const categoryRoutes = require("./routes/CategoryRoutes");
const adRoutes = require("./routes/adRoutes");
const orderRoutes = require("./routes/orderRoutes");
// const passport = require("passport");
const cors = require("cors");
// const Users = require("./models/Users");
// const LocalStrategy = require("passport-local").Strategy;
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const session = require("express-session");
const socketIo = require("socket.io");
const http = require("http");
const { socketHandler } = require("./socket");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

dotenv.config();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cors(
    {
        origin: ["https://zesty-admin.vercel.app", "http://localhost:3001", "http://localhost:3000", "https://zesty-restaurant-phi.vercel.app"],
        methods: ["POST", "GET", "DELETE", "PUT"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
        withCredentials: true,
        exposedHeaders: ["Set-Cookie"]
    }
));

// app.use((req, res, next) => {
//     res.header("Access-Control-Allow-Origin", "https://zesty-admin.vercel.app");
//     res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
//     res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
//     res.header("Access-Control-Allow-Credentials", "true");
//     next();
// });

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
    store: new MongoStore({ mongoUrl: process.env.MONGODB_URI }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));

app.use('/images', express.static('images'));
// app.use(passport.initialize());
// app.use(passport.session());
// passport.use(new LocalStrategy(Users.authenticate()));
// passport.serializeUser(Users.serializeUser());
// passport.deserializeUser(Users.deserializeUser());

app.get("/", (req, res) => {
    return res.json("Hello")
})

app.use("/user", userRoutes);
app.use("/admin", adminRoutes);
app.use("/restaurant", restaurantRoutes);
app.use("/menu", menuRoutes);
app.use("/otp", otpRoutes);
app.use("/payment", paymentRoutes);
app.use("/category", categoryRoutes);
app.use("/zestyMart", zestyMartRoutes);
app.use("/coupon", couponRoutes);
app.use("/ad", adRoutes);
app.use("/order", orderRoutes);

const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
        origin: ["https://zesty-admin.vercel.app", "http://localhost:3001", "http://localhost:3000", "https://zesty-restaurant-phi.vercel.app"],
        methods: ["GET", "POST"]
    }
});

app.set("socketio", io);
socketHandler(io);

app.post("/ask-help", async (req, res) => {
    const { email, name, query } = req.body;
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        auth: {
            user: 'tlakadiya5@gmail.com',
            pass: 'lvxiyorjhvwywcqp'
        }
    });

    let mailOptions = ({
        from: 'tlakadiya5@gmail.com',
        to: "zestyy377@gmail.com",
        subject: 'Query by restaurant',
        text: '\n Name : ' + name + "\n Query : " + query + "\n Email : " + email
    });

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            res.status(500).send('err in sending mail.')
        } else {
            res.status(200).send('Mail sent');
        }
    });
});

server.listen(5000, () => {
    console.log("serve on http://localhost:5000");
})