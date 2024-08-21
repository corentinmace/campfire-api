import { ObjectId } from "mongodb";
import { Lang } from "../utils/types"
export default class Weapon {
    constructor(
        public names: Lang,
        public description: Lang,
        public attack: number | object,
        public location: Array<ObjectId>,
        public image: string,
        public category: string,
        public id?: ObjectId
    ) {}
}