const express = require('express')
const body_parser = require('body-parser')
const axios = require('axios')
require('dotenv').config()

const app = express().use(body_parser.json())

const token = process.env.TOKEN
const mytoken = process.env.MYTOKEN

app.listen(process.env.PORT, () => {
  console.log('Webhook is listening')
})

app.get('/webhook', (req, res) => {
  let mode = req.query['hub.mode']
  let challenge = req.query['hub.challenge']
  let token = req.query['hub.verify_token']

  if (mode && token) {
    if (mode === 'subscribe' && token === mytoken) {
      res.status(200).send(challenge)
    } else {
      res.status(403).send('Forbidden')
    }
  }
})

app.post('/webhook', (req, res) => {
  let body_param = req.body

  console.log(JSON.stringify(body_param, null, 2))

  if (body_param.object) {
    if (
      body_param.entry &&
      body_param.entry[0].changes &&
      body_param.entry[0].changes[0].value.messages &&
      body_param.entry[0].changes[0].value.messages[0]
    ) {
      let phone_no_id =
        body_param.entry[0].changes[0].value.metadata.phone_number_id
      let from = body_param.entry[0].changes[0].value.messages[0].from
      let msg_body = body_param.entry[0].changes[0].value.messages[0].text.body

      console.log('phone number ' + phone_no_id)
      console.log('from ' + from)
      console.log('message body ' + msg_body)

      let user_message = msg_body.toLowerCase().trim()

      let reply_message = ""

      if (user_message === 'sim!' || user_message === 'sim') {
        reply_message = 'Você respondeu SIM!'
      } else if (user_message === 'não!' || user_message === 'nao!' || user_message === 'não' || user_message === 'nao') {
        reply_message = 'Você respondeu NÃO!'
      } else {
        reply_message = `Desculpe, não entendi sua resposta: ${msg_body}`
      }

      axios({
        method: 'POST',
        url:
          'https://graph.facebook.com/v20.0/' +
          phone_no_id +
          '/messages?access_token=' +
          token,
        data: {
          messaging_product: 'whatsapp',
          to: from,
          text: {
            body: reply_message,
          },
        },
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(response => {
        console.log('Mensagem enviada com sucesso')
      })
      .catch(error => {
        console.error('Erro ao enviar mensagem: ', error)
      })

      res.sendStatus(200)
    } else {
      res.sendStatus(404)
    }
  }
})

app.get('/', (req, res) => {
  res.status(200).send('Hello! This is the WhatsApp Webhook setup')
})
