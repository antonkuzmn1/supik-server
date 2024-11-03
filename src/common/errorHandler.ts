import {Response} from "express";
import {logger} from "../logger";

export const errorHandler = (error: unknown, res: Response): Response => {
    if (error instanceof Error) {
        logger.error(error.message);
        return res.status(500).send(error.message);
    } else {
        console.error(error);
        logger.error('Unexpected error');
        return res.status(500).send('Unexpected error');
    }
}
