import express, {Application, Express, Request, Response} from 'express'
import rateLimit, {RateLimitRequestHandler} from 'express-rate-limit'
import dotenv from 'dotenv'
import cors from 'cors'

import swaggerDocs from './utils/swagger'
import routes from './routes'
import {connectToDatabase} from './utils/database'
import {usersRouter} from "./routes/users.router";

dotenv.config()

const app: Express = express()
const port: number | string | undefined = process.env.API_PORT || 8000

const limiter: RateLimitRequestHandler = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
})

app.use(cors({
    origin: '*',
}))

app.use(limiter)
app.use('/images', express.static('./public/images'));

app.listen(port, async function () {
    console.log(`Server is running on port ${port}`);
    const db = await connectToDatabase();

    /**
    * Documented Routes
    */
    routes(app, db);

    /**
    * Swagger Docs
    */
    swaggerDocs(app, port);

    /**
    * Undocumented Routes
    */
    app.use("/api/users", usersRouter);
    
})