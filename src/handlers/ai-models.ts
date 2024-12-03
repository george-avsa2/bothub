import express, { Request, Response } from "express";
import { UserStore } from "../models/user";
import { verifyAuthToken } from "../middlewares/verifyAuthToken";
import { AIModelStore } from "../models/ai-model";
import { AIModelService } from "../api/ai-model-service";

const createModel = async (req: Request, res: Response): Promise<void> => {
  const { name, costPer100Tokens, apiToken, apiUrl } = req.body;

  if (!name || !costPer100Tokens || !apiToken || !apiUrl) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  try {
    const model = await modelStore.createModel(
      name,
      costPer100Tokens,
      apiToken,
      apiUrl
    );
    res.status(201).json(model);
  } catch (err: any) {
    res.status(500).json({ message: `Cannot create model: ${err.message}` });
  }
};

const getModelById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const model = await modelStore.getModelById(parseInt(id));
    if (!model) {
      res.status(404).json({ message: `Model with ID ${id} not found` });
      return;
    }
    res.status(200).json(model);
  } catch (err: any) {
    res.status(500).json({ message: `Cannot fetch model: ${err.message}` });
  }
};

const streamResponseAndUpdateBalance = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { payload } = req.body;

  const userId = res?.locals?.token?.id;

  if (!payload || !userId) {
    res
      .status(400)
      .json({ message: "Missing required fields: tokensUsed or payload" });
    return;
  }

  try {
    const model = await modelStore.getModelById(parseInt(id));
    if (!model) {
      res.status(404).json({ message: `Model with ID ${id} not found` });
      return;
    }

    const user = await userStore.getById(userId);
    if (!user) {
      res.status(404).json({ message: `User with ID ${userId} not found` });
      return;
    }

    if (user.balance !== undefined && user.balance <= 0) {
      res.status(403).json({ message: "Insufficient balance" });
      return;
    }

    const stream = await modelService.streamResponse(
      model,
      {
        model: model.name,
        messages: payload,
        stream: true,
      },
      user,
      userStore
    );
    res.writeHead(200, { "Content-Type": "application/json" });

    for await (const chunk of stream) {
      res.write(chunk);
    }

    res.end();
  } catch (err: any) {
    res
      .status(500)
      .json({ message: `Error during model interaction: ${err.message}` });
  }
};

const modelRoutes = (app: express.Application): void => {
  app.post("/models", verifyAuthToken, createModel);
  app.get("/models/:id", verifyAuthToken, getModelById);
  app.post(
    "/models/:id/stream",
    verifyAuthToken,
    streamResponseAndUpdateBalance
  );
};

export default modelRoutes;

const modelStore = new AIModelStore();
const userStore = new UserStore();
const modelService = new AIModelService();
