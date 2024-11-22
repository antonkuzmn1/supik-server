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
import {errorHandler} from "../common/errorHandler";
import {Request, Response} from "express";
import {prisma} from "../prisma";

export class SettingsService {
    constructor() {
        logger.debug('SettingsService');
    }

    async get(_req: Request, res: Response): Promise<Response> {
        logger.debug('SettingsService.get');
        try {
            const settings = await prisma.settings.findMany();
            return res.status(200).json(settings);
        } catch (error: unknown) {
            return errorHandler(error, res);
        }
    }

    async put(req: Request, res: Response): Promise<Response> {
        logger.debug('SettingsService.put');
        try {
            const key = req.body.key
            if (!key) {
                logger.error('Key is undefined');
                return res.status(403).send('Key is undefined');
            }

            const value = req.body.value
            if (!value) {
                logger.error('Value is undefined');
                return res.status(403).send('Value is undefined');
            }

            await prisma.settings.update({where: {key}, data: {value}});

            const settings = await prisma.settings.findMany();
            return res.status(200).json(settings);
        } catch (error: unknown) {
            return errorHandler(error, res);
        }
    }
}
