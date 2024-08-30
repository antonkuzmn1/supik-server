import {logger} from "../../logger";
import {Request, Response} from "express";
import {DbRouterGroupEditorRepository} from "./db-router-group-editor.repository";

const className = 'DbRouterService';

export class DbRouterGroupEditorService {

    constructor(
        private readonly repository: DbRouterGroupEditorRepository,
    ) {
        logger.debug(className);
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

    delete = async(req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.delete');
        try {
            return this.trueDelete(req, res);
        } catch (error) {
            console.error(error);
            logger.error('Internal Server Error');
            return res.status(500).send('Internal Server Error');
        }
    }

    private create = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.create');
        const response = await this.repository.create(req.body.routerId, req.body.groupId);
        return res.status(200).json(response);
    }

    private trueDelete = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.trueDelete');
        const response = await this.repository.delete(req.body.routerId, req.body.groupId);
        return res.status(200).json(response);
    }
}
