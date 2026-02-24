
import { env } from "./config/env";
import { createApp } from "./app";

const app = createApp();

app.listen(env.app.port, () => {
  console.log(
    `Auth server running on port ${env.app.port} (${env.app.nodeEnv})`
  );
});
