//Please see these docs: https://open-wa.github.io/wa-automate-nodejs/classes/client.html#middleware
import * as fs from 'fs';
import { create, Client, ev, Chat } from '@open-wa/wa-automate';
import * as stringify from 'csv-stringify';
import axios from 'axios';
import { default as PQueue } from 'p-queue';
import * as express from 'express';

// import { create, Client } from '@open-wa/wa-automate';
// import { create, Client } from '../src/index';

const queue = new PQueue({ concurrency: 5 });

ev.on('qr.**', async (qrcode:any,sessionId:any) => {
  // console.log("TCL: qrcode", qrcode)
  //     console.log("TCL: qrcode,sessioId", qrcode,sessionId)
  //base64 encoded qr code image
  const imageBuffer = Buffer.from(qrcode.replace('data:image/png;base64,',''), 'base64');
  fs.writeFileSync(`./public/qr_code${sessionId?'_'+sessionId:''}.png`, imageBuffer);
});

ev.on('**', async (data:any,sessionId:any,namespace:any) => {
  console.log("\n----------")
  console.log('EV',data,sessionId,namespace)
  console.log("----------")
})

const app = express();
app.use(express.static('public'))
app.use(express.json());
const PORT = 8082;

//Create your webhook here: https://webhook.site/
const WEBHOOK_ADDRESS = 'PASTE_WEBHOOK_DOT_SITE_UNIQUE_URL_HERE'

async function fire(data:any){
    return await axios.post(WEBHOOK_ADDRESS, data)
}

const wh = (event:any) => async (data:any) => {
    const ts = Date.now();
    return await queue.add(()=>fire({
        ts,
        event,
        data
    }))
}

async function start(client:Client, app:any){
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

  app.get('/download-contacts', async (req:any, res:any) => {
    const dataToWrite: string[][] = []
    const headers: string[] = [
      'Name',
      'Group Membership',
      'Phone 1 - Type',
      'Phone 1 - Value',
      'Organization 1 - Type',
      'Organization 1 - Name',
      'Organization 1 - Yomi Name'
    ]

    dataToWrite.push(headers)

    const getAllChats = await client.getAllChats();
    const csvExport = `contacts-${new Date()}.csv`;

    getAllChats.forEach((el: Chat) => {
      // el.msgs
      if (!el.isGroup) {
      dataToWrite.push([(`${el.contact.pushname || el.contact.formattedName || el.contact.name}`), '', 'Mobile', el.contact.id.user, '', ''])
      }
    });

    stringify(dataToWrite, function(err:any, output:any) {

      if (err) {
        console.log('Some error occured converting.', err);
      }

      // fs.writeFile(csvExport || '', output || '', 'utf8', function(err2:any) {
      //   if (err) {
      //     console.log('Some error occured - file either not saved or corrupted file saved.', err2);
      //   } else {
      //     console.log('It\'s saved!');
      //   }
      // });
      res.header('Content-Type', 'text/csv');
      res.attachment(csvExport);
      res.send(output);
    });
    // res.send('csv generated')
  })

}

create({
  sessionId:'session1'
})
.then(async (client:Client) => await start(client, app))
.catch((e:any)=>{
  console.log('Error',e.message);
});

app.listen(PORT, function () {
  console.log(`\n• Listening on port ${PORT}!`);
});
