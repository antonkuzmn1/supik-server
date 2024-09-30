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

export class DbMailService extends Crud {

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
            const include = {user: true}
            const data = await prisma.mail.findUnique({where, include});
            if (!data) {
                logger.error(`Entity with ID ${id} not found`);
                return res.status(403).send(`Entity with ID ${id} not found`);
            }
            return res.status(200).json({mail: data});
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

            const password = req.query.password;
            if (password) {
                where = {
                    ...where,
                    password: {
                        contains: password,
                    },
                }
            }

            const nameFirst = req.query.nameFirst;
            if (nameFirst) {
                where = {
                    ...where,
                    nameFirst: {
                        contains: nameFirst,
                    },
                }
            }

            const nameLast = req.query.nameLast;
            if (nameLast) {
                where = {
                    ...where,
                    nameLast: {
                        contains: nameLast,
                    },
                }
            }

            const nameMiddle = req.query.nameMiddle;
            if (nameMiddle) {
                where = {
                    ...where,
                    nameMiddle: {
                        contains: nameMiddle,
                    },
                }
            }

            const position = req.query.position;
            if (position) {
                where = {
                    ...where,
                    position: {
                        contains: position,
                    },
                }
            }

            const isEnabled = req.query.isEnabled;
            if (isEnabled !== undefined) {
                where = {
                    ...where,
                    isEnabled: isEnabled === 'true' ? 1 : 0,
                }
            }

            const isAdmin = req.query.isAdmin;
            if (isAdmin !== undefined) {
                where = {
                    ...where,
                    isAdmin: isAdmin === 'true' ? 1 : 0,
                }
            }

            const userId = req.query.userId as string
            if (userId) {
                where = {
                    ...where,
                    userId: {
                        in: userId.split(',').map(Number),
                    },
                }
            }

            const include = {user: true}
            const data = await prisma.mail.findMany({where, include});

            return res.status(200).json({mails: data});
        } catch (error: unknown) {
            return errorHandler(error, res);
        }
    }

    protected create = async (req: Request, res: Response): Promise<Response> => {
        const funcName = this.className + '.create';
        logger.debug(funcName);
        try {
            const nickname = req.body.data.nickname;
            const password = req.body.data.password;
            const nameFirst = req.body.data.nameFirst;
            const nameLast = req.body.data.nameLast;
            const nameMiddle = req.body.data.nameMiddle;
            const position = req.body.data.position;
            const isAdmin = req.body.data.isAdmin;
            const userId = req.body.data.userId;

            const mailYandexToken = process.env.MAIL_YANDEX_TOKEN;
            const mailYandexOrgId = process.env.MAIL_YANDEX_ORG_ID;

            console.log('req.body.data:', req.body.data);

            try {
                const createdAccountByAPI = await axios.post(
                    `https://api360.yandex.net/directory/v1/org/${mailYandexOrgId}/users`,
                    {
                        nickname: nickname,
                        departmentId: 1,
                        name: {
                            first: nameFirst,
                            last: nameLast,
                            middle: nameMiddle,
                        },
                        position: position,
                        isAdmin: isAdmin,
                        password: password,
                    },
                    {
                        headers: {
                            'Authorization': `OAuth ${mailYandexToken}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
                const data = {
                    mailId: createdAccountByAPI.data.id,
                    nickname: createdAccountByAPI.data.nickname,
                    password: password,
                    email: createdAccountByAPI.data.email,
                    nameFirst: createdAccountByAPI.data.name.first,
                    nameLast: createdAccountByAPI.data.name.last,
                    nameMiddle: createdAccountByAPI.data.name.middle,
                    position: createdAccountByAPI.data.position,
                    isAdmin: createdAccountByAPI.data.isAdmin ? 1 : 0,
                    userId: userId ? userId : null,
                }
                console.log('data for prisma', data);

                try {
                    const newValue = await prisma.mail.create({data});

                    await prisma.log.create({
                        data: {
                            action: 'create_mail',
                            newValue: newValue,
                            initiatorId: req.body.account.id,
                            mailId: newValue.id,
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
            const nickname = req.body.data.nickname;
            const password = req.body.data.password;
            const nameFirst = req.body.data.nameFirst;
            const nameLast = req.body.data.nameLast;
            const nameMiddle = req.body.data.nameMiddle;
            const position = req.body.data.position;
            const isAdmin = req.body.data.isAdmin;
            const isEnabled = req.body.data.isEnabled;
            const userId = req.body.data.userId;

            const mailYandexToken = process.env.MAIL_YANDEX_TOKEN;
            const mailYandexOrgId = process.env.MAIL_YANDEX_ORG_ID;

            console.log(req.body.data);

            const mailEntity = await prisma.mail.findUnique({where: {id}});
            if (!mailEntity) {
                return res.status(404).json({error: `Mail with ID:${id} Not Found`});
            }

            const mailId = mailEntity.mailId;

            const passwordIsEquals = mailEntity.password === password;

            try {
                const updatedAccountByAPI = await axios.patch(
                    `https://api360.yandex.net/directory/v1/org/${mailYandexOrgId}/users/${mailId}`,
                    {
                        nickname: nickname,
                        departmentId: 1,
                        name: {
                            first: nameFirst,
                            last: nameLast,
                            middle: nameMiddle,
                        },
                        position: position,
                        isAdmin: !!isAdmin,
                        isEnabled: !!isEnabled,
                        password: password.length > 0 && !passwordIsEquals ? password : null,
                    },
                    {
                        headers: {
                            'Authorization': `OAuth ${mailYandexToken}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
                const where = {id};
                const dataWithoutPassword = {
                    mailId: updatedAccountByAPI.data.id,
                    nickname: updatedAccountByAPI.data.nickname,
                    email: updatedAccountByAPI.data.email,
                    nameFirst: updatedAccountByAPI.data.name.first,
                    nameLast: updatedAccountByAPI.data.name.last,
                    nameMiddle: updatedAccountByAPI.data.name.middle,
                    position: updatedAccountByAPI.data.position,
                    isEnabled: updatedAccountByAPI.data.isEnabled ? 1 : 0,
                    isAdmin: updatedAccountByAPI.data.isAdmin ? 1 : 0,
                    userId: userId ? userId : null,
                }
                const data = password.length > 0 ? {...dataWithoutPassword, password} : dataWithoutPassword;
                console.log(data);

                try {
                    const newValue = await prisma.mail.update({where, data});

                    await prisma.log.create({
                        data: {
                            action: 'update_mail',
                            newValue: newValue,
                            initiatorId: req.body.account.id,
                            mailId: newValue.id,
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
            return res.status(200).send('Not working');
        } catch (error: unknown) {
            return errorHandler(error, res);
        }
    }

    syncAccounts = async (req: Request, res: Response): Promise<Response> => {
        const funcName = this.className + '.syncAccounts';
        logger.debug(funcName);
        try {
            const mailYandexToken = process.env.MAIL_YANDEX_TOKEN;
            const mailYandexOrgId = process.env.MAIL_YANDEX_ORG_ID;

            const accountsByAPI = await axios.get(
                `https://api360.yandex.net/directory/v1/org/${mailYandexOrgId}/users?perPage=999999`,
                {
                    headers: {
                        'Authorization': `OAuth ${mailYandexToken}`,
                        'Content-Type': 'application/json',
                    },
                },
            );

            console.log('accountsByAPI:', accountsByAPI.data.users.length);

            await prisma.mail.updateMany({
                where: {deleted: 0},
                data: {deleted: 1}
            })

            for (const accountByAPI of accountsByAPI.data.users) {
                const where = {
                    mailId: accountByAPI.id,
                }
                const accountsByMailId = await prisma.mail.findMany({where});
                if (accountsByMailId.length > 0) {
                    const accountByDB = accountsByMailId[accountsByMailId.length - 1] as any
                    const data = {
                        mailId: accountByAPI.id,
                        nickname: accountByAPI.nickname,
                        email: accountByAPI.email,
                        nameFirst: accountByAPI.name.first,
                        nameLast: accountByAPI.name.last,
                        nameMiddle: accountByAPI.name.middle,
                        position: accountByAPI.position,
                        isEnabled: accountByAPI.isEnabled ? 1 : 0,
                        isAdmin: accountByAPI.isAdmin ? 1 : 0,
                        deleted: 0,
                    }
                    await prisma.mail.update({
                        where: {id: accountByDB.id},
                        data,
                    })
                } else {
                    const data = {
                        mailId: accountByAPI.id,
                        nickname: accountByAPI.nickname,
                        email: accountByAPI.email,
                        nameFirst: accountByAPI.name.first,
                        nameLast: accountByAPI.name.last,
                        nameMiddle: accountByAPI.name.middle,
                        position: accountByAPI.position,
                        isEnabled: accountByAPI.isEnabled ? 1 : 0,
                        isAdmin: accountByAPI.isAdmin ? 1 : 0,
                    }
                    await prisma.mail.create({data})
                    logger.info('created new account by sync');
                }
            }

            return res.status(200).json({info: 'Success'});
        } catch (error: unknown) {
            return errorHandler(error, res);
        }
    }
}
