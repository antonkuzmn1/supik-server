/*

Copyright 2024 Anton Kuzmin (https://github.com/antonkuzmn1)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

import {logger} from "../logger";
import {CrudInterface} from "../common/crud.interface";
import {Request, Response} from "express";
import {RouterOsRepository} from "./router-os.repository";
import {RouterOSAPI} from "node-routeros";

const className = 'RouterOsService';

export class RouterOsService implements CrudInterface {
    constructor(
        private readonly repository: RouterOsRepository,
    ) {
        logger.debug(className);
    }

    get = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.get');
        try {
            const api: RouterOSAPI = req.body.api;

            const idString = req.query.idString as string;
            if (!idString) {
                const vpns = await this.repository.findMany(api);
                return res.status(200).json(vpns);
            }

            const vpn = await this.repository.findUnique(api, idString);
            return res.status(200).json(vpn[0]);
        } catch (error) {
            console.error(error);
            logger.error('Internal Server Error');
            return res.status(500).send('Internal Server Error');
        }
    }

    post = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.post');
        try {
            const api: RouterOSAPI = req.body.api;

            const name = req.body.name as string;
            if (!name) {
                logger.debug('"name" field is required');
                return res.status(400).send('"name" field is required');
            }
            const password = req.body.password as string;
            if (!password) {
                logger.debug('"password" field is required');
                return res.status(400).send('"password" field is required');
            }
            const profile = req.body.profile as string;
            if (!profile) {
                logger.debug('"profile" field is required');
                return res.status(400).send('"profile" field is required');
            }
            const remoteAddress = req.body.remoteAddress as string;
            if (!remoteAddress) {
                logger.debug('"remoteAddress" field is required');
                return res.status(400).send('"remoteAddress" field is required');
            }
            const service = req.body.service as string;
            const disabled = req.body.disabled as string;

            const raw = await this.repository.create(
                api,
                name,
                password,
                profile,
                remoteAddress,
                service,
                disabled,
            );

            const vpn = await this.repository.findUnique(api, raw[0].ret as any as string);
            return res.status(200).json(vpn[0]);
        } catch (error) {
            console.error(error);
            logger.error('Internal Server Error');
            return res.status(500).send('Internal Server Error');
        }
    }

    put = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.put');
        try {
            const api: RouterOSAPI = req.body.api;

            const id = req.body.idString as string;
            const name = req.body.name as string;
            const password = req.body.password as string;
            const profile = req.body.profile as string;
            const remoteAddress = req.body.remoteAddress as string;
            const service = req.body.service as string;
            const disabled = req.body.disabled as string;

            await this.repository.update(
                api,
                id,
                name,
                password,
                profile,
                remoteAddress,
                service,
                disabled,
            );

            const vpn = await this.repository.findUnique(api, id);
            return res.status(200).json(vpn[0]);
        } catch (error) {
            console.error(error);
            logger.error('Internal Server Error');
            return res.status(500).send('Internal Server Error');
        }
    }

    delete = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.delete');
        try {
            const api: RouterOSAPI = req.body.api;

            const id = req.body.idString as string;

            const result = await this.repository.delete(
                api,
                id,
            );

            return res.status(200).json(result);
        } catch (error) {
            console.error(error);
            logger.error('Internal Server Error');
            return res.status(500).send('Internal Server Error');
        }
    }

}
