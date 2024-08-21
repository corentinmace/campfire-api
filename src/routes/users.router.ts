import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import { collections } from "../utils/database";
import User from "../models/users.model";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {validateToken} from "../middlewares/validateToken";
import {isAdmin} from "../middlewares/isAdmin";
import {ObjectId} from "mongodb";

dotenv.config();

export const usersRouter = express.Router();

usersRouter.use(express.json());

usersRouter.post("/register", async (req: Request, res: Response) => {
    const user = req.body as User
    if(!user.username || !user.email || !user.password) return res.status(400).json({ message: "Please fill all fields" });
    const userAvailable: any = await collections.users?.findOne({ email: user.email });
    if(userAvailable) return res.status(400).json({ message: "User already exists" });

    const hashPassword = await bcrypt.hash(user.password, 10);

    const newUser: User = new User(user.username, user.email, hashPassword, [], [], 'connected', 'USER');
    const result = await collections.users?.insertOne(newUser);
    if(!result) return res.status(500).json({ message: "Something went wrong" });
    res.status(201).json({ message: "User created", id: result.insertedId, username: user.username, email: user.email })

});
usersRouter.post("/login", async (req: Request, res: Response) => {
    const user: User = req.body as User;

    if(!user.email || !user.password) return res.status(400).json({ message: "Please fill all fields" });

    const userExist: any = await collections.users?.findOne({ email: user.email });
    if(!userExist) return res.status(400).json({ message: "User doesn't exist" });

    if(userExist && await bcrypt.compare(user.password, userExist.password)) {
      const accessToken = jwt.sign({
          user: {
              username: user.username,
              email: user.email,
              id: userExist._id
          },
        }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: "1h" });
      res.status(200).json({ accessToken: accessToken })
    } else {
        res.status(401).json({ message: "Invalid credentials" })
    }
});
usersRouter.get("/current", validateToken, async (req: Request, res: Response) => {
    // @ts-ignore
    const user: any = await collections.users?.findOne({ email: req.user.email });
    const retUser = {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture
    }

    // @ts-ignore
    res.json(retUser)
});

usersRouter.get("/all", isAdmin, async (req: Request, res: Response) => {
    const users = await collections.users?.find({}).toArray();
    if(users) res.json(users);
});

usersRouter.patch("/:id", isAdmin, async (req: Request, res: Response) => {
    const id = req?.params?.id;

    try {
        const updatedUser = req.body;
        console.log(updatedUser)
        const query = { _id: new ObjectId(id) };

        // @ts-ignore
        const result = await collections.users?.findOneAndUpdate(query, {$set: updatedUser}, {upset: true});
        console.log(result)
        result?.value
            ? res.status(200).send(`Successfully updated user with id ${id}`)
            : res.status(304).send(`User with id: ${id} not updated`);
    } catch (error: any) {
        console.error(error.message);
        res.status(400).send(error.message);
    }
});

usersRouter.delete("/:id", isAdmin, async (req: Request, res: Response) => {
    const id = req?.params?.id;

    try {
        const query = { _id: new ObjectId(id) };
        // @ts-ignore
        const result = await collections.users.deleteOne(query);

        if (result && result.deletedCount) {
            res.status(202).send(`Successfully removed user with id ${id}`);
        } else if (!result) {
            res.status(400).send(`Failed to remove user with id ${id}`);
        } else if (!result.deletedCount) {
            res.status(404).send(`Weapon with id ${id} does not exist`);
        }
    } catch (error:any) {
        console.error(error.message);
        res.status(400).send(error.message);
    }
});