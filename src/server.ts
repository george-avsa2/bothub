import express from "express";
import userRoutes from "./handlers/users";
import modelRoutes from "./handlers/ai-models";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

const swaggerDocument = YAML.load("./swagger.yaml");

const app: express.Application = express();

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = process.env.PORT || 3000;
export const address = `0.0.0.0:${PORT}`;

app.use(express.json());

userRoutes(app);
modelRoutes(app);

app.listen(PORT, (): void => {
  console.log(`REST API on ${address}`);
});

export default app;
