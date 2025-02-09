const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/", (req, res) => {
    return res.json({ message: "Hello" });
})

router.post("/validate-otp", async (req, res) => {
    try {
        const { number, verificationId, otp } = req.body;
        // console.log(number);

        const response = await axios.get(`https://cpaas.messagecentral.com/verification/v3/validateOtp?countryCode=91&mobileNumber=${number}&verificationId=${verificationId}&customerId=C-9761C5894CA2454&code=${otp}`, {
            headers: {
                'authToken': 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJDLTk3NjFDNTg5NENBMjQ1NCIsImlhdCI6MTczODQ5NTU4NiwiZXhwIjoxODk2MTc1NTg2fQ.8AnGMLdv7DcccoVkpdtIOqgJZiX95wjkX23vG06oy2DSxR41qok_TDFsWO7YzSIPwE9i10fvnJmM5vHouckCuA',
            },
        });

        if (response.status === 200) {
            res.status(200).json("otp verified");
        } else {
            console.log(res);
        }
    } catch (error) {
        console.log(error);

    }
})

module.exports = router;