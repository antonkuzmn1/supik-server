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
import axios, {AxiosError} from "axios";
import {errorHandler} from "../../common/errorHandler";

const className = 'DbRouterGroupEditorService';

export class DbMailGroupMailGroupService {

    constructor() {
        logger.debug(className);
    }


    post = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.post');
        try {
            return this.create(req, res);
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

    delete = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.delete');
        try {
            return this.trueDelete(req, res);
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

    private create = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.create');
        try {
            const mailGroupIdDBParent = req.body.mailGroupIdParent;
            const mailGroupIdDB = req.body.mailGroupId;

            console.log(mailGroupIdDBParent);
            console.log(mailGroupIdDB);

            const mailGroupEntityParent = await prisma.mailGroup.findUnique({
                where: {id: mailGroupIdDBParent}
            })
            if (!mailGroupEntityParent) {
                return res.status(404).json({error: `MailGroup with ID:${mailGroupIdDBParent} Not Found`});
            }
            const mailGroupIdParent = mailGroupEntityParent.mailGroupId

            const mailGroupEntity = await prisma.mailGroup.findUnique({
                where: {id: mailGroupIdDB}
            })
            if (!mailGroupEntity) {
                return res.status(404).json({error: `MailGroup with ID:${mailGroupEntity} Not Found`});
            }
            const mailGroupId = mailGroupEntity.mailGroupId

            const mailYandexToken = process.env.MAIL_YANDEX_TOKEN;
            const mailYandexOrgId = process.env.MAIL_YANDEX_ORG_ID;

            try {
                const responseByYandexAPI = await axios.post(
                    `https://api360.yandex.net/directory/v1/org/${mailYandexOrgId}/groups/${mailGroupIdParent}/members`,
                    {
                        id: mailGroupId,
                        type: "group",
                    },
                    {
                        headers: {
                            'Authorization': `OAuth ${mailYandexToken}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
                if (responseByYandexAPI.data.added) {
                    const data = {
                        mailGroupIdParent: mailGroupIdDBParent,
                        mailGroupId: mailGroupIdDB,
                    }
                    console.log('data for prisma', data);

                    const include = {
                        mailGroup: true,
                    }

                    try {
                        const newValue = await prisma.mailGroupMailGroup.create({data, include});
                        return res.status(200).json({created: newValue});
                    } catch (error: unknown) {
                        console.error((error as AxiosError).response?.data);
                        return errorHandler(error, res);
                    }
                } else {
                    return errorHandler("Not created", res);
                }
            } catch (error: unknown) {
                console.error((error as AxiosError).response?.data);
                return errorHandler(error, res);
            }
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

    private trueDelete = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.trueDelete');
        try {
            const mailGroupIdDBParent = req.body.mailGroupIdParent;
            const mailGroupIdDB = req.body.mailGroupId;

            const mailGroupEntityParent = await prisma.mailGroup.findUnique({
                where: {id: mailGroupIdDBParent}
            })
            if (!mailGroupEntityParent) {
                return res.status(404).json({error: `MailGroup with ID:${mailGroupIdDBParent} Not Found`});
            }
            const mailGroupIdParent = mailGroupEntityParent.mailGroupId

            const mailGroupEntity = await prisma.mailGroup.findUnique({
                where: {id: mailGroupIdDB}
            })
            if (!mailGroupEntity) {
                return res.status(404).json({error: `MailGroup with ID:${mailGroupIdDB} Not Found`});
            }
            const mailGroupId = mailGroupEntity.mailGroupId

            const mailYandexToken = process.env.MAIL_YANDEX_TOKEN;
            const mailYandexOrgId = process.env.MAIL_YANDEX_ORG_ID;

            console.log(mailGroupIdParent);
            console.log(mailGroupId);

            try {
                const responseByYandexAPI = await axios.delete(
                    `https://api360.yandex.net/directory/v1/org/${mailYandexOrgId}/groups/${mailGroupIdParent}/members/group/${mailGroupId}`,
                    {
                        headers: {
                            'Authorization': `OAuth ${mailYandexToken}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
                if (responseByYandexAPI.data.deleted) {
                    const where = {
                        mailGroupId_mailGroupIdParent: {
                            mailGroupIdParent: mailGroupEntity.id,
                            mailGroupId: mailGroupEntityParent.id,
                        },
                    }
                    console.log('data for prisma', where);

                    try {
                        const deleted = await prisma.mailGroupMailGroup.delete({where});
                        return res.status(200).json({deleted});
                    } catch (error: unknown) {
                        console.error((error as AxiosError).response?.data);
                        return errorHandler(error, res);
                    }
                } else {
                    return errorHandler("Not deleted", res);
                }
            } catch (error: unknown) {
                console.error((error as AxiosError).response?.data);
                return errorHandler(error, res);
            }
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
