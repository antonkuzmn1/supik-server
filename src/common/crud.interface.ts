import {Request, Response} from "express";

export interface CrudInterface {

    get(req: Request, res: Response): Promise<Response>;

    post(req: Request, res: Response): Promise<Response>;

    put(req: Request, res: Response): Promise<Response>;

    delete(req: Request, res: Response): Promise<Response>;

}
