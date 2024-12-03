import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserWithCredentials, UserStore } from "../models/user";
import { verifyAuthToken } from "../middlewares/verifyAuthToken";
import { HandlerError } from "./helpers/handleError";
import { isTheUser } from "../utils/user";

const store = new UserStore();

const index = async (req: Request, res: Response): Promise<string | void> => {
  try {
    const users = await store.index();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

const show = async (req: Request, res: Response): Promise<void> => {
  const user_id = req.params.id;
  try {
    const user = await store.getById(user_id);
    const isTheOwnUser = isTheUser(
      parseInt(res.locals.token.id),
      parseInt(user_id)
    );
    if (!user) {
      throw new HandlerError(404, `We don't have that user`);
    }
    if (!isTheOwnUser) {
      res.json({
        firstname: user.firstname,
        lastname: user.lastname,
      });
      return;
    }
    res.json(user);
  } catch (err) {
    if (err instanceof HandlerError) {
      res.status(err.statusCode).json({ message: err.message });
    } else {
      res.status(500).json({ message: "Something went wrong!" });
    }
  }
};

const create = async (req: Request, res: Response): Promise<void> => {
  const user: UserWithCredentials = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    password: req.body.password,
  };
  try {
    if (!user.firstname || !user.lastname) {
      throw new HandlerError(400, `firstname and lastname are required`);
    }
    if (!user.password) {
      throw new HandlerError(400, `password is required`);
    }
    const createUser = await store.create(user);
    const token = jwt.sign(
      { user: createUser },
      process.env.TOKEN_SECRET || ""
    );
    res.json(token);
  } catch (err) {
    if (err instanceof HandlerError) {
      res.status(err.statusCode).json({ message: err.message });
    } else {
      res.status(500).json({ message: "Something went wrong!" });
    }
  }
};

const authenticate = async (req: Request, res: Response): Promise<void> => {
  const user: UserWithCredentials = {
    id: req.body.id,
    password: req.body.password,
  };
  try {
    const authenticate = await store.authenticate(user);
    if (!authenticate) {
      throw new HandlerError(401, `Wrong id or password`);
    }
    const token = await jwt.sign(
      { user: authenticate },
      process.env.TOKEN_SECRET || ""
    );
    res.json(token);
  } catch (err) {
    if (err instanceof HandlerError) {
      res.status(err.statusCode).json({ message: err.message });
    } else {
      res.status(500).json({ message: "Something went wrong!" });
    }
  }
};

const updateBalance = async (req: Request, res: Response): Promise<void> => {
  const userId: string = res.locals.token.id;
  const newBalance: number = req.body.balance;
  try {
    const user = await store.getById(userId);
    if (!user) {
      throw new HandlerError(404, "User not found");
    }

    const updatedUser = await store.updateBalance(userId, newBalance);
    if (!updatedUser) {
      throw new HandlerError(500, "Failed to update balance");
    }

    delete updatedUser.password_digest;

    res.json(updatedUser);
  } catch (err) {
    if (err instanceof HandlerError) {
      res.status(err.statusCode).json({ message: err.message });
    } else {
      res.status(500).json({ message: "Something went wrong!" });
    }
  }
};

const userRoutes = (app: express.Application): void => {
  app.get("/users", verifyAuthToken, index);
  app.get("/users/:id", verifyAuthToken, show);
  app.post("/users", create);
  app.post("/users/authenticate", authenticate);
  app.patch("/users", verifyAuthToken, updateBalance);
};

export default userRoutes;
