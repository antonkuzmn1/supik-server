import {logger} from "../logger";
import {CrudInterface} from "../common/crud.interface";
import {Request, Response} from "express";
import {RouterOsRepository} from "./router-os.repository";

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
            const host = req.query.host as string;
            if (!host) {
                return res.status(400).send('"host" field is required');
            }
            const user = req.query.user as string;
            if (!user) {
                return res.status(400).send('"user" field is required');
            }
            const password = req.query.password as string;
            if (!password) {
                return res.status(400).send('"password" field is required');
            }

            const api = await this.repository.getApi(
                host,
                user,
                password,
            ).connect();
            if (!api.connected) {
                return res.status(400).send('Connection failed');
            }

            const idString = req.query.idString as string;
            if (!idString) {
                const vpns = await this.repository.getVpnAccounts(api);
                return res.status(200).json(vpns);
            }

            const vpn = await this.repository.getVpnAccountById(api, idString);
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
