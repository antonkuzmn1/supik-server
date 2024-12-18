import {Crud} from "../../common/crud";
import {Request, Response} from "express";
import {logger} from "../../logger";
import {prisma} from "../../prisma";
import {errorHandler} from "../../common/errorHandler";

export class DbItemDocumentService extends Crud {

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
            const select = {
                id: true,
                created: true,
                updated: true,
                deleted: true,
                blob: false,
                name: true,
                type: true,
                note: true,
                date: true,
                itemId: true,
                item: true,
            };
            const data = await prisma.item.findUnique({where, select});
            if (!data) {
                logger.error(`Entity with ID ${id} not found`);
                return res.status(403).send(`Entity with ID ${id} not found`);
            }
            return res.status(200).json({itemDocument: data});
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

            const type = req.query.type;
            if (type) {
                where = {
                    ...where,
                    type: {
                        contains: type,
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

            const dateGte = req.query.dateGte;
            if (dateGte) {
                where = {
                    ...where,
                    date: {
                        gte: new Date(dateGte as string),
                    },
                }
            }

            const dateLte = req.query.dateLte;
            if (dateLte) {
                where = {
                    ...where,
                    date: {
                        lte: new Date(dateLte as string),
                    },
                }
            }

            const itemId = req.query.itemId as string
            if (itemId) {
                where = {
                    ...where,
                    itemId: {
                        in: itemId.split(',').map(Number),
                    },
                }
            }

            const select = {
                id: true,
                created: true,
                updated: true,
                deleted: true,
                blob: false,
                name: true,
                type: true,
                note: true,
                date: true,
                itemId: true,
                item: true,
            };
            const data = await prisma.itemDocument.findMany({where, select});

            return res.status(200).json({itemDocuments: data});
        } catch (error: unknown) {
            return errorHandler(error, res);
        }
    }

    protected create = async (req: Request, res: Response): Promise<Response> => {
        const funcName = this.className + '.create';
        logger.debug(funcName);
        try {
            const base64Blob = req.body.data.blob;
            const blob = Buffer.from(base64Blob, 'base64');
            const name = req.body.data.name;
            const type = req.body.data.type;
            const note = req.body.data.note;
            const date = req.body.data.date;
            const itemId = req.body.data.itemId;

            const data = {
                blob,
                name,
                type,
                note,
                date: new Date(date),
                itemId,
            };
            const response = await prisma.itemDocument.create({data});

            await prisma.log.create({
                data: {
                    action: 'create_item_document',
                    newValue: response,
                    initiatorId: req.body.account.id,
                    itemDocumentId: response.id,
                },
            });

            return res.status(200).json({itemDocument: response});
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
            const response = await prisma.itemDocument.update({where, data});

            await prisma.log.create({
                data: {
                    action: 'delete_item_document',
                    newValue: response,
                    initiatorId: req.body.account.id,
                    itemId: response.id,
                },
            });

            return res.status(200).json({itemDocument: response});
        } catch (error: unknown) {
            return errorHandler(error, res);
        }
    }

    getBlob = async (req: Request, res: Response): Promise<Response> => {
        const funcName = this.className + '.getBlob';
        logger.debug(funcName);
        try {
            const id = Number(req.query.id);
            if (!id) {
                logger.error(`${funcName}: ID is undefined`);
                return res.status(403).send('ID is undefined');
            }
            const where = {id};
            const select = {
                id: true,
                blob: true,
                name: true,
            };
            const data = await prisma.itemDocument.findUnique({where, select});
            if (!data) {
                logger.error(`Entity with ID ${id} not found`);
                return res.status(403).send(`Entity with ID ${id} not found`);
            }
            return res.status(200).json({itemDocument: data});
        } catch (error: unknown) {
            return errorHandler(error, res);
        }
    }
}
