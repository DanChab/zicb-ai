'use strict'
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN

const express = require('express')
const bodyParser = require('body-parser')
const bot = require('./bot')
const services = require('./services')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true}))


const server = app.listen(process.env.PORT || 5000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env)
})

app.get('/', (req, res) => {
  res.json({statusCode: 200})
})


/* For Facebook Validation */
app.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] && req.query['hub.verify_token'] === process.env.VERIFICATION_TOKEN) {
    res.status(200).send(req.query['hub.challenge'])
  } else {
    res.status(403).end()
  }
});

/* Handling all messenges */
app.post('/webhook', (req, res) => {
  if (req.body.object === 'page') {
    req.body.entry.forEach((entry) => {
      entry.messaging.forEach((event) => {
        if (event.message) {
          if (event.message.quick_reply){
            bot.processQuickReply(event)
          
          }else if (event.message.text){
              bot.receivedMessage(event)
            }
        } else if (event.postback) {
          bot.processPostback(event)
        }
      });
    });
    res.status(200).end();
  }
});

/* Webhook for DialogFlow api to get response from the 3rd party API */
app.post('/lipila', (req, res) => {
  console.log('*** Webhook for api.ai query ***')
  console.log(req.body.result)
  let aiText = req.body.result.fulfillment.speech
  console.log(`aiText: ${aiText}`)
  let action = req.body.result.action
  console.log(`action :${action}`)
  res.json({statusCode:200})
})