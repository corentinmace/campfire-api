import jwt from "jsonwebtoken";
import {NextFunction, Request, Response} from "express";
import dotenv from "dotenv";
import {collections} from "../utils/database";

dotenv.config();

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    let token;
    let authHeader: string | string[] | undefined = req.headers.authorization || req.headers.Authorization;
    if (authHeader && typeof authHeader !== "string" || authHeader?.startsWith("Bearer")) {
        if (typeof authHeader === "string") {
            token = authHeader.split(" ")[1];
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, async(err: any, decoded: any) => {
                if(err) {
                    console.log("Error: ", err)
                    res.status(401).json({ message: "Invalid token" })
                } else {
                    // @ts-ignore
                    req.user = decoded.user
                    // @ts-ignore
                    const user: any = await collections.users?.findOne({ email: req.user.email });
                    const retUser = {
                        id: user._id,
                        username: user.username,
                        email: user.email,
                        role: user.role,
                    }
                    if (retUser.role === "ADMIN") {
                        // @ts-ignore
                        res.status(200)
                        next();
                    } else {
                        console.log("other error", err)
                        res.status(401).json({ message: "Unauthorized" })
                    }
                }
            })
        }

    }

    if(!token) {
        res.status(401).json({message: "Unauthorized"})
    }
}