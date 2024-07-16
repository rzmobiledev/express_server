import { Request, Response } from "express";
import { ErrResHandler } from "../utils/utils";
import { SuccessMsgEnum } from "../utils/enum";

const Gallery = require('../models').Gallery;

module.exports = {

    async uploadFiles(req: Request, res: Response){
        const error = new ErrResHandler(res);
        try{
            
            return res.status(200).json({message: req.files}); 
            // const gallery = await Gallery
        }catch(err){
            return error.get_globalError(err);
        }
    }
}