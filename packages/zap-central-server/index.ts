//Please see these docs: https://open-wa.github.io/wa-automate-nodejs/classes/client.html#middleware
const fs = require('fs');
import { create, Client, ev } from '@open-wa/wa-automate';

// import { create, Client } from '@open-wa/wa-automate';
// import { create, Client } from '../src/index';
const axios = require('axios').default;

const { default: PQueue } = require("p-queue");
const queue = new PQueue({ concurrency: 5 });


ev.on('qr.**', async (qrcode,sessionId) => {
  // console.log("TCL: qrcode", qrcode)
  //     console.log("TCL: qrcode,sessioId", qrcode,sessionId)
  //base64 encoded qr code image
  const imageBuffer = Buffer.from(qrcode.replace('data:image/png;base64,',''), 'base64');
  fs.writeFileSync(`qr_code${sessionId?'_'+sessionId:''}.png`, imageBuffer);
});

ev.on('**', async (data,sessionId,namespace) => {
  console.log("\n----------")
  console.log('EV',data,sessionId,namespace)
  console.log("----------")
})


const express = require('express');
const app = express();
app.use(express.json());
const PORT = 8082;

//Create your webhook here: https://webhook.site/
const WEBHOOK_ADDRESS = 'PASTE_WEBHOOK_DOT_SITE_UNIQUE_URL_HERE'

async function fire(data){
    return await axios.post(WEBHOOK_ADDRESS, data)
}

const wh = event => async (data) => {
    const ts = Date.now();
    return await queue.add(()=>fire({
        ts,
        event,
        data
    }))
}

async function start(client:Client){
  app.use(client.middleware);
  client.onAck(wh('ack'))
  client.onAnyMessage(wh('any_message'))
  client.onMessage(wh('message'))

  //requires a group id
  //   client.onParticipantsChanged(wh('message'))
  client.onAddedToGroup(wh('added_to_group'))
  client.onBattery(wh('battery'))
  client.onContactAdded(wh('contact_added'))
  client.onIncomingCall(wh('incoming_call'))
  client.onPlugged(wh('plugged'))
  client.onStateChanged(wh('state'))

  //this is only for insiders
  client.onRemovedFromGroup(wh('removed_from_group'))

  app.listen(PORT, function () {
    console.log(`\n• Listening on port ${PORT}!`);
  });
}

create({
    sessionId:'session1'
})
  .then(async client => await start(client))
  .catch(e=>{
    console.log('Error',e.message);
  });
