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

import {Crud} from "../../common/crud";
import {Request, Response} from "express";
import {logger} from "../../logger";
import {prisma} from "../../prisma";
import {errorHandler} from "../../common/errorHandler";

export class DbItemService extends Crud {

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
                documents: true,
                user: true,
            };
            const data = await prisma.item.findUnique({where, include});
            if (!data) {
                logger.error(`Entity with ID ${id} not found`);
                return res.status(403).send(`Entity with ID ${id} not found`);
            }
            return res.status(200).json({item: data});
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

            const type = req.query.type;
            if (type) {
                where = {
                    ...where,
                    type: {
                        contains: type,
                    },
                }
            }

            const article = req.query.article;
            if (article) {
                where = {
                    ...where,
                    article: {
                        contains: article,
                    },
                }
            }

            const vendor = req.query.vendor;
            if (vendor) {
                where = {
                    ...where,
                    vendor: {
                        contains: vendor,
                    },
                }
            }

            const device = req.query.device;
            if (device) {
                where = {
                    ...where,
                    device: {
                        contains: device,
                    },
                }
            }

            const serialNumber = req.query.serialNumber;
            if (serialNumber) {
                where = {
                    ...where,
                    serialNumber: {
                        contains: serialNumber,
                    },
                }
            }

            const partNumber = req.query.partNumber;
            if (partNumber) {
                where = {
                    ...where,
                    partNumber: {
                        contains: partNumber,
                    },
                }
            }

            const supplier = req.query.supplier;
            if (supplier) {
                where = {
                    ...where,
                    supplier: {
                        contains: supplier,
                    },
                }
            }

            const deliveryDateGte = req.query.deliveryDateGte;
            if (deliveryDateGte) {
                where = {
                    ...where,
                    deliveryDate: {
                        gte: new Date(deliveryDateGte as string),
                    },
                }
            }

            const deliveryDateLte = req.query.deliveryDateLte;
            if (deliveryDateLte) {
                where = {
                    ...where,
                    deliveryDate: {
                        lte: new Date(deliveryDateLte as string),
                    },
                }
            }

            const warrantyMonthsGte = req.query.warrantyMonthsGte;
            if (warrantyMonthsGte) {
                where = {
                    ...where,
                    warrantyMonths: {
                        gte: warrantyMonthsGte,
                    },
                }
            }

            const warrantyMonthsLte = req.query.warrantyMonthsLte;
            if (warrantyMonthsLte) {
                where = {
                    ...where,
                    warrantyMonths: {
                        lte: warrantyMonthsLte,
                    },
                }
            }

            const costGte = req.query.costGte;
            if (costGte) {
                where = {
                    ...where,
                    cost: {
                        gte: costGte,
                    },
                }
            }

            const costLte = req.query.costLte;
            if (warrantyMonthsLte) {
                where = {
                    ...where,
                    cost: {
                        lte: costLte,
                    },
                }
            }

            const state = req.query.state;
            if (state) {
                where = {
                    ...where,
                    state: {
                        contains: state,
                    },
                }
            }

            const specs = req.query.specs;
            if (specs) {
                where = {
                    ...where,
                    specs: {
                        contains: specs,
                    },
                }
            }

            const note = req.query.note;
            if (note) {
                where = {
                    ...where,
                    note: {
                        contains: note,
                    },
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

            const include = {
                documents: true,
                user: true,
            };
            const data = await prisma.item.findMany({where, include});

            return res.status(200).json({items: data});
        } catch (error: unknown) {
            return errorHandler(error, res);
        }
    }

    protected create = async (req: Request, res: Response): Promise<Response> => {
        const funcName = this.className + '.create';
        logger.debug(funcName);
        try {
            const type = req.body.data.type;
            const article = req.body.data.article;
            const vendor = req.body.data.vendor;
            const device = req.body.data.device;
            const serialNumber = req.body.data.serialNumber;
            const partNumber = req.body.data.partNumber;
            const supplier = req.body.data.supplier;
            const deliveryDate = req.body.data.deliveryDate;
            const warrantyMonths = req.body.data.warrantyMonths;
            const cost = req.body.data.cost;
            const state = req.body.data.state;
            const specs = req.body.data.specs;
            const note = req.body.data.note;
            const userId = req.body.data.userId;

            if (!article || article?.length === 0) {
                return res.status(400).send('Article cannot be empty');
            }

            const duplicateArticle = await prisma.item.findMany({
                where: {
                    article,
                    deleted: 0,
                },
            });
            if (duplicateArticle.length > 0) {
                return res.status(400).send('Article already exists');
            }

            const data = {
                type,
                article,
                vendor,
                device,
                serialNumber,
                partNumber,
                supplier,
                deliveryDate: new Date(deliveryDate),
                warrantyMonths: Number(warrantyMonths),
                cost: Number(cost),
                state,
                specs,
                note,
                userId: userId ? userId : null,
            };
            const include = {
                documents: true,
                user: true,
            };
            const response = await prisma.item.create({data, include});

            await prisma.log.create({
                data: {
                    action: 'create_item',
                    newValue: response,
                    initiatorId: req.body.account.id,
                    itemId: response.id,
                },
            });

            return res.status(200).json({item: response});
        } catch (error: unknown) {
            return errorHandler(error, res);
        }
    }

    protected update = async (req: Request, res: Response): Promise<Response> => {
        const funcName = this.className + '.update';
        logger.debug(funcName);
        try {
            const id = req.body.data.id;
            const type = req.body.data.type;
            const article = req.body.data.article;
            const vendor = req.body.data.vendor;
            const device = req.body.data.device;
            const serialNumber = req.body.data.serialNumber;
            const partNumber = req.body.data.partNumber;
            const supplier = req.body.data.supplier;
            const deliveryDate = req.body.data.deliveryDate;
            const warrantyMonths = req.body.data.warrantyMonths;
            const cost = req.body.data.cost;
            const state = req.body.data.state;
            const specs = req.body.data.specs;
            const note = req.body.data.note;
            const userId = req.body.data.userId;

            console.log(req.body.data);

            const duplicateArticle = await prisma.item.findMany({
                where: {
                    article,
                    deleted: 0,
                    id: {
                        not: id,
                    },
                },
            });
            if (duplicateArticle.length > 0) {
                return res.status(400).send('Article already exists');
            }

            const where = {
                id,
            };
            const data = {
                type,
                article,
                vendor,
                device,
                serialNumber,
                partNumber,
                supplier,
                deliveryDate: new Date(deliveryDate),
                warrantyMonths: Number(warrantyMonths),
                cost: Number(cost),
                state,
                specs,
                note,
                userId: userId ? userId : null,
            };
            const include = {
                documents: true,
                user: true,
            };
            const response = await prisma.item.update({where, data, include});

            await prisma.log.create({
                data: {
                    action: 'update_item',
                    newValue: response,
                    initiatorId: req.body.account.id,
                    itemId: response.id,
                },
            });

            return res.status(200).json({item: response});
        } catch (error: unknown) {
            return errorHandler(error, res);
        }
    }

    protected softDelete = async (req: Request, res: Response): Promise<Response> => {
        const funcName = this.className + '.softDelete';
        logger.debug(funcName);
        try {
            const id = req.body.id;

            const where = {
                id,
            };
            const data = {
                deleted: 1,
            };
            const include = {
                documents: true,
                user: true,
            };
            const response = await prisma.item.update({where, data, include});

            await prisma.log.create({
                data: {
                    action: 'delete_item',
                    newValue: response,
                    initiatorId: req.body.account.id,
                    itemId: response.id,
                },
            });

            return res.status(200).json({item: response});
        } catch (error: unknown) {
            return errorHandler(error, res);
        }
    }

}
