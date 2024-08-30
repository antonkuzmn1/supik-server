import {logger} from "../../logger";
import {Request, Response} from "express";
import {CrudInterface} from "../../common/crud.interface";
import {DbUserRepository} from "./db-user.repository";

const className = 'DbUserService';

export class DbUserService implements CrudInterface {

    constructor(
        private readonly repository: DbUserRepository,
    ) {
        logger.debug(className);
    }

    get = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.get');
        try {
            if (req.query.id) {
                return this.findUnique(req, res);
            } else {
                return this.findMany(req, res);
            }
        } catch (error) {
            console.error(error);
            logger.error('Internal Server Error');
            return res.status(500).send('Internal Server Error');
        }
    }

    post = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.post');
        try {
            return this.create(req, res);
        } catch (error) {
            console.error(error);
            logger.error('Internal Server Error');
            return res.status(500).send('Internal Server Error');
        }
    }

    put = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.put');
        try {
            return this.update(req, res);
        } catch (error) {
            console.error(error);
            logger.error('Internal Server Error');
            return res.status(500).send('Internal Server Error');
        }
    }

    delete = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.delete');
        try {
            return this.softDelete(req, res);
        } catch (error) {
            console.error(error);
            logger.error('Internal Server Error');
            return res.status(500).send('Internal Server Error');
        }
    }

    private findUnique = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.findUnique');
        const id = Number(req.query.id);
        if (!id) {
            logger.error('ID is undefined');
            return res.status(403).send('ID is undefined');
        }
        const response = await this.repository.findUnique(id);
        if (!response) {
            logger.error(`Entity with ID ${id} not found`);
            return res.status(403).send(`Entity with ID ${id} not found`);
        }
        return res.status(200).json(response);
    }

    private findMany = async (_req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.findMany');
        const response = await this.repository.findMany();
        return res.status(200).json(response);
    }

    private create = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.create');
        const { account, ...dataToCreate } = req.body;
        const response = await this.repository.create(dataToCreate);
        return res.status(200).json(response);
    }

    private update = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.update');
        const { account, ...dataToCreate } = req.body;
        const response = await this.repository.update(dataToCreate);
        return res.status(200).json(response);
    }

    private softDelete = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.softDelete');
        const response = await this.repository.delete(req.body.id);
        return res.status(200).json(response);
    }

}
