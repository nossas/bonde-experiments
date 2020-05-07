import * as throng from "throng";
import { subscriptionFormEntries } from "./features/settings";

throng({
  workers: 1,
  start: async (id: number) => {
    console.log(`Started worker ${id}`);

    try {
      console.log(
        `Call subscriptions to form_entries... ${Number(process.env.WIDGET_ID) || 1}`
      );
      await subscriptionFormEntries([{
        id: Number(process.env.WIDGET_ID) || 1,
        metadata: JSON.parse(process.env.WIDGET_METADATA) || {}
      }]);
    } catch (err) {
      console.error("throng err: ".red, err);
    }

    process.on("SIGTERM", function () {
      console.log(`Worker ${id} exiting`);
      console.log("Cleanup here");
      process.exit();
    });
  }
});
