const express = require("express");
const Users = require("../models/Users");
const passport = require("passport");
const router = express.Router();

router.get("/", (req, res) => {
    return res.json({message: "Hello"});
})

router.post("/signup", async (req, res) => {
    try {
        const {username, phone, password, email} = req.body;
        const isAdmin = req.body.isAdmin === true;
        const user = await Users.register(new Users({ username, isAdmin, phone, email }), password);
        passport.authenticate("local")(req, res, () => {            
            return res.status(200).json({ success: true, user });
        })
    } catch (error) {
        return res.status(500).json({success: false, error: error.message});
    }
});

router.post("/signin", async (req, res) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        if (!user) {
            return res.status(405).json({ success: false, message: "Wrong credentials." });
        }

        req.logIn(user, (loginErr) => {
            if (loginErr) {
                return res.status(500).json({ success: false, error: loginErr.message });
            }
            return res.json({ success: true, user })
        });
    })(req, res, next)
});

router.get("/checkAuth", (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ authenticated: true, user: req.user });
    } else {
        res.json({ authenticated: false, user: null });
    }
});

router.get("/logout", (req, res) => {
    req.logOut(err => {
        if(err) {
            return res.status(501).json({success: false, error: err.message});
        }
        return res.status(200).json({success: true});
    });
});

module.exports = router;