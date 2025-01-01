const express = require("express");
const Users = require("../models/Users");
const passport = require("passport");
const isAuthenticated = require("../middleware/authentication");

const router = express.Router();

router.post("/signup", async (req, res) => {
    try {
        const { username, password, secretCode } = req.body;
        if (secretCode !== "ZestyAdmin@123") {
            return res.status(405).send("Wrong Secret Code.");
        }

        const userExist = await Users.findOne({ username: username });
        if (userExist) {
            return res.status(403).json({ err: "User Exist" });
        }

        const isAdmin = true;
        const user = await Users.register(new Users({ username, isAdmin }), password);
        // passport.authenticate("local")(req, res, () => {
        return res.status(200).send("Signup Success");
        // });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

router.post("/signin", async (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            return res.status(501).json({ success: false, error: error.message });
        }

        if (!user) {
            return res.status(405).json({ success: false, message: "Wrong Credentials." });
        }

        req.logIn(user, (loginErr) => {
            if (loginErr) {
                console.log(loginErr);
                
                return res.status(406).json({ success: false, error: loginErr.message });
            }

            if(user.isAdmin === true){
                return res.status(200).json({ success: true, user });
            } else {
                return res.status(401).json({success: false, message: "Not Authenticated"})
            }
        });
    })(req, res, next)
});

router.get("/checkAuth", (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ authenticated: true, user: req.user });
    } else {
        res.json({ authenticated: false, user: null });
    }
})

router.get("/logout", (req, res) => {
    req.logOut(err => {
        if (err) {
            return res.status(501).json({ success: false, error: err.message });
        }
        return res.status(200).json({ success: true });
    })
})

module.exports = router;