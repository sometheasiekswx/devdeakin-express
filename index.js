const express = require('express')
const cors = require('cors')
const client = require('@mailchimp/mailchimp_marketing')
require('dotenv').config()

client.setConfig({
    apiKey: process.env.MAILCHIMP_API_KEY,
    server: process.env.MAILCHIMP_SERVER,
});

const app = express()
app.use(cors())

app.post('/api/subscribe', async (req, res) => {
    const email = req.query.email

    const response = await client.lists.addListMember("2a083e1a80", {
        email_address: email,
        status: "subscribed",
    });
    if (response.email_address === email) {
        res.send(`${response.email_address} is subscribed : )`);
    }

    res.status(500)
})

const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})