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

import {logger} from "../../logger";
import {Request, Response} from "express";
import {prisma} from "../../prisma";

export class SecurityAccountGroupService {
    constructor() {
        logger.debug('SecurityAccountGroupService');
    }

    async post(req: Request, res: Response) {
        logger.debug('SecurityAccountGroupService.post');
        try {

            const {
                accountId,
                groupId,
            } = req.body;

            if (!accountId) {
                logger.error('"accountId" field required');
                return res.status(400).send('"accountId" field required');
            }
            if (!groupId) {
                logger.error('"groupId" field required');
                return res.status(400).send('"groupId" field required');
            }

            const response = await prisma.accountGroup.create({
                data: {
                    accountId,
                    groupId,
                },
            });

            await prisma.log.create({
                data: {
                    action: 'create',
                    newValue: response,
                    initiatorId: req.body.account.id,
                    accountId: response.accountId,
                    groupId: response.groupId,
                },
            });

            return res.status(200).json(response);

        } catch (error: unknown) {
            if (error instanceof Error) {
                logger.error(error.message);
                return res.status(500).send(error.message);
            } else {
                logger.error('Unexpected error');
                return res.status(500).send('Unexpected error');
            }
        }
    }

    async delete(req: Request, res: Response) {
        logger.debug('SecurityAccountGroupService.delete');
        try {

            const {
                accountId,
                groupId,
            } = req.body;

            if (!accountId) {
                logger.error('"accountId" field required');
                return res.status(400).send('"accountId" field required');
            }
            if (!groupId) {
                logger.error('"groupId" field required');
                return res.status(400).send('"groupId" field required');
            }

            const response = await prisma.accountGroup.delete({
                where: {
                    accountId_groupId: {
                        accountId,
                        groupId,
                    },
                },
            });

            await prisma.log.create({
                data: {
                    action: 'delete',
                    newValue: response,
                    initiatorId: req.body.account.id,
                    accountId: response.accountId,
                    groupId: response.groupId,
                },
            });

            return res.status(200).json(response);

        } catch (error: unknown) {
            if (error instanceof Error) {
                logger.error(error.message);
                return res.status(500).send(error.message);
            } else {
                logger.error('Unexpected error');
                return res.status(500).send('Unexpected error');
            }
        }
    }

}
