const express = require('express')
const cors = require('cors')
const client = require('@mailchimp/mailchimp_marketing')

require('dotenv').config()

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

client.setConfig({
    apiKey: process.env.MAILCHIMP_API_KEY,
    server: process.env.MAILCHIMP_SERVER,
});

const app = express()
app.use(cors())

app.post('/api/check-customer-exists', async (req, res) => {
    const email = req.query.email

    try {
        const customer = await stripe.customers.list({
            email: email,
            limit: 1
        });
        if (customer.data.length === 0) res.send(false);
        if (customer.data[0].email === email) {
            res.send(true);
        }
        res.send(false);
    } catch (e) {
        res.status(500, e)
    }
});

app.post('/api/create-checkout-session', async (req, res) => {
    const session = await stripe.checkout.sessions.create({
        line_items: [
            {
                price_data: {
                    currency: 'aud',
                    product_data: {
                        name: 'DevDeakin Premuim by Somethea Siek',
                    },
                    unit_amount: 99,
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `${process.env.REACT_FRONTEND_BASE_URL}/plans`,
        cancel_url: `${process.env.REACT_FRONTEND_BASE_URL}/plans`,
    });

    res.redirect(303, session.url);
});

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