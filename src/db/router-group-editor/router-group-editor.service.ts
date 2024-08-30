import {logger} from "../../logger";
import {Request, Response} from "express";
import {CrudInterface} from "../../common/crud.interface";

export class RouterGroupEditorService implements CrudInterface {

    constructor() {
        logger.debug(this.constructor.name);
    }

    async get(req: Request, res: Response): Promise<Response> {
        logger.debug(this.constructor.name + '.get');
        try {

            return res.status(200).json();

        } catch (error) {
            console.error(error);
            logger.error('Internal Server Error');
            return res.status(500).send('Internal Server Error');
        }
    }

    async post(req: Request, res: Response): Promise<Response> {
        logger.debug(this.constructor.name + '.post');
        try {

            return res.status(200).json();

        } catch (error) {
            console.error(error);
            logger.error('Internal Server Error');
            return res.status(500).send('Internal Server Error');
        }
    }

    async put(req: Request, res: Response): Promise<Response> {
        logger.debug(this.constructor.name + '.put');
        try {

            return res.status(200).json();

        } catch (error) {
            console.error(error);
            logger.error('Internal Server Error');
            return res.status(500).send('Internal Server Error');
        }
    }

    async delete(req: Request, res: Response): Promise<Response> {
        logger.debug(this.constructor.name + '.delete');
        try {

            return res.status(200).json();

        } catch (error) {
            console.error(error);
            logger.error('Internal Server Error');
            return res.status(500).send('Internal Server Error');
        }
    }
}
