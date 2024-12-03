import https from "https";
import { AIModel } from "../models/ai-model";
import { User, UserStore } from "../models/user";

let clients = [];

export class AIModelService {
  async streamResponse(
    model: AIModel,
    payload: any,
    user: User,
    userStore: UserStore
  ): Promise<NodeJS.ReadableStream> {
    const requestData = JSON.stringify(payload);

    return new Promise((resolve, reject) => {
      const url = new URL(model.apiUrl);

      const options: https.RequestOptions = {
        hostname: url.hostname,
        path: url.pathname,
        method: "POST",
        headers: {
          Authorization: `Bearer ${model.apiToken}`,
          "Content-Type": "application/json",
          // 'Content-Type': 'text/event-stream',
          "Content-Length": Buffer.byteLength(requestData),
        },
      };

      const req = https.request(options, (res) => {
        let promptTokens = 0;
        res.addListener("data", (data) => {
          try {
            const chunkData = JSON.parse(data.toString().replace("data: ", ""));
            promptTokens = chunkData?.usage?.prompt_tokens;
          } catch (e) {}
        });
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          res.on("end", async () => {
            if (user?.id) {
              const newBalance = user?.balance
                ? user.balance - (model.costPer100Tokens / 100) * promptTokens
                : 0;
              await userStore.updateBalance(user.id.toString(), newBalance);
            }
          });
          resolve(res);
        } else {
          let errorData = "";
          res.on("data", (chunk) => {
            console.log(chunk);
            errorData += chunk;
          });
          res.on("end", () => {
            reject(
              new Error(
                `Failed to stream response: ${res.statusCode} - ${errorData}`
              )
            );
          });
        }
      });

      req.on("error", (err) => {
        reject(new Error(`Request error: ${err.message}`));
      });

      req.write(requestData);
      req.end();
    });
  }
}
