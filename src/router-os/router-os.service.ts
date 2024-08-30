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
            return res.status(200).json(vpn);
        } catch (error) {
            console.error(error);
            logger.error('Internal Server Error');
            return res.status(500).send('Internal Server Error');
        }
    }

    post = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.post');
        try {
            return res.status(200).json({});
        } catch (error) {
            console.error(error);
            logger.error('Internal Server Error');
            return res.status(500).send('Internal Server Error');
        }
    }

    put = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.put');
        try {
            return res.status(200).json({});
        } catch (error) {
            console.error(error);
            logger.error('Internal Server Error');
            return res.status(500).send('Internal Server Error');
        }
    }

    delete = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.delete');
        try {
            return res.status(200).json({});
        } catch (error) {
            console.error(error);
            logger.error('Internal Server Error');
            return res.status(500).send('Internal Server Error');
        }
    }

}
