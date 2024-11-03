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
import {Crud} from "../../common/crud";
import {errorHandler} from "../../common/errorHandler";
import {prisma} from "../../prisma";
import axios, {AxiosError} from "axios";

export class DbMailGroupService extends Crud {

    constructor() {
        super();
    }

    protected findUnique = async (req: Request, res: Response): Promise<Response> => {
        const funcName = this.className + '.findUnique';
        logger.debug(funcName);
        try {
            const id = Number(req.query.id);
            if (!id) {
                logger.error(`${funcName}: ID is undefined`);
                return res.status(403).send('ID is undefined');
            }
            const where = {id};
            const include = {
                members: {
                    include: {mail: true}
                },
            };
            const data = await prisma.mailGroup.findUnique({where, include});
            if (!data) {
                logger.error(`Entity with ID ${id} not found`);
                return res.status(403).send(`Entity with ID ${id} not found`);
            }
            return res.status(200).json({mailGroup: data});
        } catch (error: unknown) {
            return errorHandler(error, res);
        }
    }

    protected findMany = async (req: Request, res: Response): Promise<Response> => {
        const funcName = this.className + '.findMany';
        logger.debug(funcName);
        try {
            let where: any = {
                deleted: 0,
            }

            const createdGte = req.query.createdGte;
            if (createdGte) {
                where = {
                    ...where,
                    created: {
                        gte: new Date(createdGte as string),
                    },
                }
            }

            const createdLte = req.query.createdLte;
            if (createdLte) {
                where = {
                    ...where,
                    created: {
                        lte: new Date(createdLte as string),
                    },
                }
            }

            const updatedGte = req.query.updatedGte;
            if (updatedGte) {
                where = {
                    ...where,
                    updated: {
                        gte: new Date(updatedGte as string),
                    },
                }
            }

            const updatedLte = req.query.updatedLte;
            if (updatedLte) {
                where = {
                    ...where,
                    updated: {
                        lte: new Date(updatedLte as string),
                    },
                }
            }

            const name = req.query.name;
            if (name) {
                where = {
                    ...where,
                    name: {
                        contains: name,
                    },
                }
            }

            const description = req.query.description;
            if (description) {
                where = {
                    ...where,
                    description: {
                        contains: description,
                    },
                }
            }

            const label = req.query.label;
            if (label) {
                where = {
                    ...where,
                    nameLast: {
                        contains: label,
                    },
                }
            }

            const include = {
                members: {
                    include: {mail: true}
                },
            };
            const data = await prisma.mailGroup.findMany({where, include});

            return res.status(200).json({mailGroups: data});
        } catch (error: unknown) {
            return errorHandler(error, res);
        }
    }

    protected create = async (req: Request, res: Response): Promise<Response> => {
        const funcName = this.className + '.create';
        logger.debug(funcName);
        try {
            const name = req.body.data.name;
            const description = req.body.data.description;
            const label = req.body.data.label;

            const mailYandexToken = process.env.MAIL_YANDEX_TOKEN;
            const mailYandexOrgId = process.env.MAIL_YANDEX_ORG_ID;

            console.log('req.body.data:', req.body.data);

            try {
                const createdAccountByAPI = await axios.post(
                    `https://api360.yandex.net/directory/v1/org/${mailYandexOrgId}/groups`,
                    {
                        name: name,
                        description: description,
                        label: label,
                    },
                    {
                        headers: {
                            'Authorization': `OAuth ${mailYandexToken}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
                const data = {
                    mailGroupId: createdAccountByAPI.data.id.toString(),
                    name: createdAccountByAPI.data.name,
                    description: createdAccountByAPI.data.description,
                    label: createdAccountByAPI.data.label,
                }
                console.log('data for prisma', data);

                try {
                    const newValue = await prisma.mailGroup.create({data});

                    await prisma.log.create({
                        data: {
                            action: 'create_mail_group',
                            newValue: newValue,
                            initiatorId: req.body.account.id,
                            mailGroupId: newValue.id,
                        },
                    })

                    return res.status(200).json({created: newValue});
                } catch (error: unknown) {
                    console.error((error as AxiosError).response?.data);
                    return errorHandler(error, res);
                }
            } catch (error: unknown) {
                console.error((error as AxiosError).response?.data);
                return errorHandler(error, res);
            }
        } catch (error: unknown) {
            return errorHandler(error, res);
        }
    }

    protected update = async (req: Request, res: Response): Promise<Response> => {
        const funcName = this.className + '.update';
        logger.debug(funcName);
        try {
            const id = req.body.data.id;
            const name = req.body.data.name;
            const description = req.body.data.description;
            const label = req.body.data.label;

            const mailYandexToken = process.env.MAIL_YANDEX_TOKEN;
            const mailYandexOrgId = process.env.MAIL_YANDEX_ORG_ID;

            console.log(req.body.data);

            const mailGroupEntity = await prisma.mailGroup.findUnique({where: {id}});
            if (!mailGroupEntity) {
                return res.status(404).json({error: `MailGroup with ID:${id} Not Found`});
            }

            const mailGroupId = mailGroupEntity.mailGroupId;

            try {
                const updatedAccountByAPI = await axios.patch(
                    `https://api360.yandex.net/directory/v1/org/${mailYandexOrgId}/groups/${mailGroupId}`,
                    {
                        name: name,
                        description: description,
                        label: label,
                    },
                    {
                        headers: {
                            'Authorization': `OAuth ${mailYandexToken}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
                const where = {id};
                const data = {
                    name: updatedAccountByAPI.data.name,
                    description: updatedAccountByAPI.data.description,
                    label: updatedAccountByAPI.data.label,
                }
                console.log(data);

                try {
                    const newValue = await prisma.mailGroup.update({where, data});

                    await prisma.log.create({
                        data: {
                            action: 'update_mail_group',
                            newValue: newValue,
                            initiatorId: req.body.account.id,
                            mailGroupId: newValue.id,
                        },
                    })

                    return res.status(200).json({created: newValue});
                } catch (error: unknown) {
                    console.error((error as AxiosError).response?.data);
                    return errorHandler(error, res);
                }
            } catch (error: unknown) {
                console.error((error as AxiosError).response?.data);
                if (error instanceof AxiosError) {
                    logger.error(error.response?.data.message);
                    return res.status(500).send(error.response?.data.message);
                } else {
                    logger.error('Unexpected error');
                    return res.status(500).send('Unexpected error');
                }
            }
        } catch (error: unknown) {
            return errorHandler(error, res);
        }
    }

    protected softDelete = async (req: Request, res: Response): Promise<Response> => {
        const funcName = this.className + '.softDelete';
        logger.debug(funcName);
        try {
            const mailYandexToken = process.env.MAIL_YANDEX_TOKEN;
            const mailYandexOrgId = process.env.MAIL_YANDEX_ORG_ID;

            const id = req.body.id;
            const where = {id}
            const mail = await prisma.mailGroup.findUnique({where});
            if (!mail) {
                return res.status(404).json({error: `Mail with ID:${id} Not Found`});
            }

            const mailGroupId = mail.mailGroupId;

            const updatedAccountByAPI = await axios.delete(
                `https://api360.yandex.net/directory/v1/org/${mailYandexOrgId}/groups/${mailGroupId}`,
                {
                    headers: {
                        'Authorization': `OAuth ${mailYandexToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            )

            if (updatedAccountByAPI.data.removed) {
                const response = await prisma.mailGroup.update({
                    where: {id},
                    data: {deleted: 1}
                });
                await prisma.log.create({
                    data: {
                        action: 'delete_mail_group',
                        newValue: response,
                        initiatorId: req.body.account.id,
                        mailGroupId: response.id,
                    },
                });
                return res.status(200).json(response);
            } else {
                return res.status(500).send('Unexpected error');
            }
        } catch (error: unknown) {
            return errorHandler(error, res);
        }
    }

    // syncAccounts = async (req: Request, res: Response): Promise<Response> => {
    //     const funcName = this.className + '.syncAccounts';
    //     logger.debug(funcName);
    //     try {
    //         const mailYandexToken = process.env.MAIL_YANDEX_TOKEN;
    //         const mailYandexOrgId = process.env.MAIL_YANDEX_ORG_ID;
    //
    //         const groupsByAPI = await axios.get(
    //             `https://api360.yandex.net/directory/v1/org/${mailYandexOrgId}/groups?perPage=999999`,
    //             {
    //                 headers: {
    //                     'Authorization': `OAuth ${mailYandexToken}`,
    //                     'Content-Type': 'application/json',
    //                 },
    //             },
    //         );
    //
    //         console.log('groupsByAPI:', groupsByAPI.data.groups.length);
    //
    //         await prisma.mailGroup.updateMany({
    //             where: {deleted: 0},
    //             data: {deleted: 1}
    //         })
    //
    //         for (const groupByAPI of groupsByAPI.data.groups) {
    //             const where = {
    //                 mailGroupId: groupByAPI.id,
    //             }
    //             const groupsByMailGroupId = await prisma.mailGroup.findMany({where});
    //             if (groupsByMailGroupId.length > 0) {
    //                 const groupByDB = groupsByMailGroupId[groupsByMailGroupId.length - 1] as any
    //                 const data = {
    //                     mailId: groupsByAPI.data.groups.id,
    //                     name: groupsByAPI.data.groups.name,
    //                     description: groupsByAPI.data.groups.description,
    //                     nameFirst: groupsByAPI.data.groups.label,
    //                     deleted: 0,
    //                 }
    //                 await prisma.mailGroup.update({
    //                     where: {id: groupByDB.id},
    //                     data,
    //                 })
    //             } else {
    //                 const data = {
    //                     mailId: groupsByAPI.data.groups.id,
    //                     name: groupsByAPI.data.groups.name,
    //                     description: groupsByAPI.data.groups.description,
    //                     nameFirst: groupsByAPI.data.groups.label,
    //                 }
    //                 await prisma.mail.create({data})
    //                 logger.info('created new group by sync');
    //             }
    //         }
    //
    //         return res.status(200).json({info: 'Success'});
    //     } catch (error: unknown) {
    //         return errorHandler(error, res);
    //     }
    // }
}
