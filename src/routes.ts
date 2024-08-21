import { Express, Request, Response } from "express";
import all_routes from 'express-list-endpoints'
import { weaponsRouter } from "./routes/weapons.router";

function routes(app: Express, db: any) {


    app.get('/api', (req: Request, res: Response) :void => {
        let routes: Array<String> = [];
        for (const route of all_routes(app)) {
            if(!route.path.startsWith("/api/users")) routes.push(`${route.methods} - ${route.path}`);
        }
        res.status(200).send(routes);
    })

    //app.use("/api/weapons", weaponsRouter);

    app.get('/healthcheck', (req: Request, res: Response) => res.sendStatus(200));

}

export default routes