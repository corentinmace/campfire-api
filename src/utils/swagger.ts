import {Express, Request, Response} from "express";
import swaggerUi from "swagger-ui-express";

import {version} from "../../package.json";

import dotenv from 'dotenv';
import swaggerAutogen from "swagger-autogen";
import swaggerFile from "../swagger.json";

dotenv.config();

const outputFile = "./swagger.json";
const endpointsFiles: Array<String> = ["./src/routes.ts"];
const config: Object = {
    info: {
        title: "Campfire API",
        description: "API for Campfire project.",
        version: version,
    },
    host: `localhost:${process.env.API_PORT}`,
    securityDefinitions: {
        api_key: {
            type: "apiKey",
            name: "api-key",
            in: "header",
        },
    },
    schemes: ["http"],
    servers: [{ url: '/api' }],
    definitions: {
        "Server Side Error": {
            $status: "ERROR",
            $msg: "some error message",
            error: {
                $message: "Error message caught",
                $name: "Error name",
                stack: "Error stack",
            },
        },
    },
};

function swaggerDocs(app: Express, port: number|string|undefined): void {
    swaggerAutogen()(outputFile, endpointsFiles, config);
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));
    console.log(`Swagger docs available at http://localhost:${port}/api/docs`);
}

export default swaggerDocs;