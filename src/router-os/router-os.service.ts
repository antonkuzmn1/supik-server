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
            return res.status(200).json(vpn[0]);
        } catch (error) {
            console.error(error);
            logger.error('Internal Server Error');
            return res.status(500).send('Internal Server Error');
        }
    }

    post = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.post');
        try {
            const api: RouterOSAPI = req.body.api;

            const name = req.body.name as string;
            if (!name) {
                logger.debug('"name" field is required');
                return res.status(400).send('"name" field is required');
            }
            const password = req.body.password as string;
            if (!password) {
                logger.debug('"password" field is required');
                return res.status(400).send('"password" field is required');
            }
            const profile = req.body.profile as string;
            if (!profile) {
                logger.debug('"profile" field is required');
                return res.status(400).send('"profile" field is required');
            }
            const remoteAddress = req.body.remoteAddress as string;
            if (!remoteAddress) {
                logger.debug('"remoteAddress" field is required');
                return res.status(400).send('"remoteAddress" field is required');
            }
            const service = req.body.service as string;
            const disabled = req.body.disabled as string;

            const raw = await this.repository.create(
                api,
                name,
                password,
                profile,
                remoteAddress,
                service,
                disabled,
            );

            const vpn = await this.repository.findUnique(api, raw[0].ret as any as string);
            return res.status(200).json(vpn[0]);
        } catch (error) {
            console.error(error);
            logger.error('Internal Server Error');
            return res.status(500).send('Internal Server Error');
        }
    }

    put = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.put');
        try {
            const api: RouterOSAPI = req.body.api;

            const idString = req.body.idString as string;
            const name = req.body.name as string;
            const password = req.body.password as string;
            const profile = req.body.profile as string;
            const remoteAddress = req.body.remoteAddress as string;
            const service = req.body.service as string;
            const disabled = req.body.disabled as string;

            await this.repository.update(
                api,
                idString,
                name,
                password,
                profile,
                remoteAddress,
                service,
                disabled,
            );

            const vpn = await this.repository.findUnique(api, idString);
            return res.status(200).json(vpn[0]);
        } catch (error) {
            console.error(error);
            logger.error('Internal Server Error');
            return res.status(500).send('Internal Server Error');
        }
    }

    delete = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.delete');
        try {
            const api: RouterOSAPI = req.body.api;

            const idString = req.body.idString as string;

            const result = await this.repository.delete(
                api,
                idString,
            );

            return res.status(200).json(result);
        } catch (error) {
            console.error(error);
            logger.error('Internal Server Error');
            return res.status(500).send('Internal Server Error');
        }
    }

}
