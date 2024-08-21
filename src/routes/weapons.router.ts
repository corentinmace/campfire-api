import express, { Request, Response } from "express";
import {InsertOneResult, ObjectId, UpdateResult} from "mongodb";
import { collections } from "../utils/database";
import Weapon from "../models/weapon.model";
import {validateToken} from "../middlewares/validateToken";

export const weaponsRouter = express.Router();


weaponsRouter.use(express.json());

weaponsRouter.get('/', async (req: Request, res: Response) => {
    // #swagger.tags = ['Weapons']
    try {
        /* #swagger.responses[200] = {
          description: "Weapons fetched successfully",
          schema: { $ref: "#/models/Weapon" }
        } */
        const weapons = (await collections.weapons?.find({}).toArray());

        res.status(200).send(weapons);
    } catch (error: any) {
        res.status(500).send(error.message);
    }
})

weaponsRouter.get("/:id", async (req: Request, res: Response) => {
    // #swagger.tags = ['Weapons']
    const id = req?.params?.id;

    try {
        const query = { _id: new ObjectId(id) };
        // @ts-ignore
        const weapon: Weapon = (await collections.weapons?.findOne(query)) as Weapon;

        if (weapon) {
            res.status(200).send(weapon);
        }
    } catch (error) {
        res.status(404).send(`Unable to find matching document with id: ${req.params.id}`);
    }
});

weaponsRouter.use(validateToken)

weaponsRouter.post("/", async (req: Request, res: Response) => {
    // #swagger.tags = ['Weapons']
    try {
        const newWeapon = req.body as Weapon;

        const result = await collections.weapons?.insertOne(newWeapon);

        result
            ? res.status(201).send(`Successfully created a new weapon with id ${result.insertedId}`)
            : res.status(500).send("Failed to create a new weapon.");
    } catch (error: any) {
        console.error(error);
        res.status(400).send(error.message);
    }
});

weaponsRouter.put("/:id", async (req: Request, res: Response) => {
    // #swagger.tags = ['Weapons']
    const id = req?.params?.id;

    try {
        const updatedWeapon: Weapon = req.body as Weapon;
        const query = { _id: new ObjectId(id) };

        const result = await collections.weapons?.updateOne(query, { $set: updatedWeapon });
        result?.modifiedCount
            ? res.status(200).send(`Successfully updated weapon with id ${id}`)
            : res.status(304).send(`Weapon with id: ${id} not updated`);
    } catch (error: any) {
        console.error(error.message);
        res.status(400).send(error.message);
    }
});

weaponsRouter.patch("/:id", async (req: Request, res: Response) => {
    // #swagger.tags = ['Weapons']
    const id = req?.params?.id;

    try {
        const updatedWeapon = req.body;
        const query = { _id: new ObjectId(id) };

        // @ts-ignore
        const result = await collections.weapons?.findOneAndUpdate(query, {$set: updatedWeapon}, {upset: true});
        result?.value
            ? res.status(200).send(`Successfully updated weapon with id ${id}`)
            : res.status(304).send(`Weapon with id: ${id} not updated`);
    } catch (error: any) {
        console.error(error.message);
        res.status(400).send(error.message);
    }
});

weaponsRouter.delete("/:id", async (req: Request, res: Response) => {
    // #swagger.tags = ['Weapons']
    const id = req?.params?.id;

    try {
        const query = { _id: new ObjectId(id) };
        // @ts-ignore
        const result = await collections.weapons.deleteOne(query);

        if (result && result.deletedCount) {
            res.status(202).send(`Successfully removed weapon with id ${id}`);
        } else if (!result) {
            res.status(400).send(`Failed to remove weapon with id ${id}`);
        } else if (!result.deletedCount) {
            res.status(404).send(`Weapon with id ${id} does not exist`);
        }
    } catch (error:any) {
        console.error(error.message);
        res.status(400).send(error.message);
    }
});