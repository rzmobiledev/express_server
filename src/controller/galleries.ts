import { Request, Response } from "express";
import { MulterResType, JWTType } from '../utils/type';
import { ErrResHandler, uploadFile, mapImageWithUserId, deleteFiles } from "../utils/utils";

const Gallery = require('../models').Gallery;

module.exports = {

    async uploadFiles(req: Request, res: Response){
        const error = new ErrResHandler(res);
        const userAccess: JWTType = res.locals?.auth;

        try{

            uploadFile.array('filenames')(req, res, async (err) => {
                if(err) return error.get_globalError(err);

                const imageWithUserID: MulterResType[] = mapImageWithUserId(req, userAccess); 
               
                await Gallery.bulkCreate(imageWithUserID)
                .then((data: typeof Gallery) => {
                    return res.status(200).json(data)
                })
                .catch(async (err: Error) => {
                    await deleteFiles(imageWithUserID);
                    return error.get_globalError(err);
                })
            });

        }catch(err){
            return error.get_globalError(err);
        }
    },

}