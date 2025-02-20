const bodyParser = require("body-parser");
const express = require("express");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const restaurantRoutes = require("./routes/restaurantRoute");
const otpRoutes = require("./routes/otpRoutes");
const menuRoutes = require("./routes/MenuRoute");
const paymentRoutes = require("./routes/paymentRoutes");
const categoryRoutes = require("./routes/CategoryRoutes");
const passport = require("passport");
const cors = require("cors");
const Users = require("./models/Users");
const LocalStrategy = require("passport-local").Strategy;
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const session = require("express-session");
const socketIo = require("socket.io");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

dotenv.config();

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
app.use("/otp", otpRoutes);
app.use("/payment", paymentRoutes);
app.use("/category", categoryRoutes);

const http = require("http");
const { socketHandler } = require("./socket");
// const { Server } = require("socket.io");
const server = http.createServer(app);
// const io = new Server(server);
// const userSockets = new Map();

const io = socketIo(server, {
    cors: {
        origin: ["https://zesty-admin.vercel.app", "http://localhost:3001", "http://localhost:3000", "https://zesty-restaurant-phi.vercel.app"],
        methods: ["GET", "POST"]
    }
});

app.set("socketio", io);
socketHandler(io);

// io.on("connection", (socket) => {
//     console.log(`Socket connected : ${socket.id}`);

//     socket.on("admin_join", (data) => {
//         userSockets.set(data, socket.id);
//         io.to(socket.id).emit("session-join", "Your Session has been started");
//     });

//     // socket.on("disconnect", () => {
//     //     for(let [userId, sockId] of userSockets.entries()) {
//     //         if (sockId == socket.id) {
//     //             userSockets.delete(userId);
//     //             break;
//     //         }
//     //     }
//     // });

//     socket.on("updateStatus", (data) => {
//         console.log("status updated: ", data);
//         io.emit('statusUpdated', data);
//     })
// });

app.get("/api/logout", (req, res) => {
    const userId = req.query.userId;

    if (!userId) {
        return res.status(400).json({ success: false, message: "user id is required" });
    }

    const socketId = userSockets.get(userId);
    if (socketId) {
        io.to(socketId).emit("session-expired", "Your Session has been terminated");
        return res.status(200).json({ success: true, message: "Logged out success" });
    } else {
        return res.status(400).json({ success: false, message: "No active session found." });
    }
})



server.listen(5000, () => {
    console.log("serve on http://localhost:5000");
})