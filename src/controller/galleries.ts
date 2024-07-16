import { Request, Response } from "express";


module.exports = {

    async uploadFiles(req: Request, res: Response){
        return res.status(200).json({message: req.file});
    }
}