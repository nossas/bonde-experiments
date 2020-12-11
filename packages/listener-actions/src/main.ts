import * as throng from "throng";
import subscriptionFormEntries from "./subscriptionFormEntries";

throng({ master, worker, count: 4 })

// This will only be called once
function master() {
  console.log('Started master')

  async () => {
    try {
      console.log(
        `Call subscriptions to form_entries... ${Number(process.env.WIDGET_ID) || 1}`
      );
      await subscriptionFormEntries([{
        id: Number(process.env.WIDGET_ID) || 1,
        metadata: JSON.parse(process.env.WIDGET_METADATA || "{}")
      }]);
    } catch (err) {
      console.error("throng err: ", err);
    }
  }

  process.on('beforeExit', () => {
    console.log('Master cleanup.')
  })
}

// This will be called four times
function worker(id) {
  let exited = false

  console.log(`Started worker ${ id }`)
    process.on('SIGTERM', shutdown)
    process.on('SIGINT', shutdown)

    async function shutdown() {
      if (exited) return
      exited = true

      await new Promise(r => setTimeout(r, 300))  // simulate async cleanup work
      console.log(`Worker ${ id } cleanup done.`)
      // disconnect()
    }
}
