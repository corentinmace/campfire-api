import { ObjectId } from "mongodb";
export default class User {
    constructor(
        public username: string,
        public email: string,
        public password: string,
        public friendList: Array<string>,
        public friendRequest: Array<string>,
        public status: string,
        public role: string,
        public profilePicture?: string,
    ) {}
}