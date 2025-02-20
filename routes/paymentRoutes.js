const express = require("express");
const { request } = require("https");
const crypto = require("crypto");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();

const MERCHANT_KEY = "96434309-7796-489d-8924-ab56988a6076";
const MERCHANT_ID = "PGTESTPAYUAT86";

// const prodPayUrl = "https://api.phonepe.com/apis/hermes/pg/v1/pay";
// const prodStatusUrl = "https://api.phonepe.com/apis/hermes/pg/v1/status";

const MERCHANT_BASE_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";
const MERCHANT_STATUS_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status";

const successUrl = "https://zesty-restaurant-phi.vercel.app/payment-success";
const failureUrl = "https://zesty-restaurant-phi.vercel.app//payment-failure";

const redirectUrl = "https://zesty-backend.onrender.com/payment/status";

router.post("/create-order", async (req, res) => {
    const { name, mobileNumber, amount } = req.body;
    const orderId = uuidv4();

    //payment gateway

    const paymentPayload = {
        merchantId: MERCHANT_ID,
        merchantUserId: name,
        mobileNumber: mobileNumber,
        amount: amount,
        merchantTransactionId: orderId,
        redirectUrl: `${redirectUrl}/?id=${orderId}`,
        redirectMode: "POST",
        paymentInstrument: {
            type: "PAY_PAGE"
        }
    }

    const payload = Buffer.from(JSON.stringify(paymentPayload)).toString('base64');
    const keyIndex = 1;
    const string = payload + "/pg/v1/pay" + MERCHANT_KEY;
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checkSum = sha256 + "###" + keyIndex;

    const option = {
        method: "POST",
        url: MERCHANT_BASE_URL,
        headers: {
            accept: "application/json",
            'Content-Type': "application/json",
            'X-VERIFY': checkSum
        },
        data: {
            request: payload
        }
    }

    try {
        const response = await axios.request(option);
        res.status(200).json({ message: "ok", url: response.data.data.instrumentResponse.redirectInfo.url });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to initiate payment" })
    }
});

router.post("/status", async (req, res) => {
    const merchantTransactionId = req.query.id;
    const keyIndex = 1;
    const string = `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + MERCHANT_KEY;
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checkSum = sha256 + "###" + keyIndex;

    const option = {
        method: "GET",
        url: `${MERCHANT_STATUS_URL}/${MERCHANT_ID}/${merchantTransactionId}`,
        headers: {
            accept: "application/json",
            'Content-Type': "application/json",
            'X-VERIFY': checkSum,
            'X-MERCHANT-ID': MERCHANT_ID
        },
    }

    axios.request(option).then((response) => {
        if (response.data.success) {
            return res.redirect(successUrl);
        } else {
            return res.redirect(failureUrl);
        }
    })
});

module.exports = router;