import { Request, Response } from "express";
import { MulterResType, JWTType, GalleryType } from '../utils/type';
import { ErrResHandler, uploadFile, mapImageWithUserId, deleteFiles, allowAdminAccess, deleteImages, delGalleryByAdmin, isGalleryExistAndDeleted } from "../utils/utils";
import { SuccessMsgEnum } from "../utils/enum";

const Gallery = require('../models').Gallery;
const User = require('../models').User;


module.exports = {

    async showAllGallery(req: Request, res: Response){
        const error = new ErrResHandler(res);
        const userAccess: JWTType = res.locals?.auth;
        
        try{
            if(!allowAdminAccess(userAccess)){

                const user = await User.findAll({
                    attributes: {exclude: ['password', 'deletedAt']},
                    where: { id: userAccess.id},
                    include: Gallery,
                });
                return res.status(200).json(user);
            }
            
            const _user = await User.findAll({include: Gallery, attributes: {exclude: ['password', 'deletedAt']}})
            return res.status(200).json(_user);

        }catch(err){
            return error.get_globalError(err);
        }
    },

    async showGalleryByID(req: Request, res: Response){
        const error = new ErrResHandler(res);
        const userAccess: JWTType = res.locals?.auth;
        const galleryId = Number(req.params.id);

        try{
            if(!allowAdminAccess(userAccess)){
                const gallery = await Gallery.findOne({
                    where: {id: galleryId, userId: userAccess.id}
                });

                if(!gallery) return error.get_404_galleryNotFound();
                return res.status(200).json(gallery);
            }
            
            const _gallery = await Gallery.findOne({ where: {id: galleryId} });
            if(!_gallery) return error.get_404_galleryNotFound();
            return res.status(200).json(_gallery);

        }catch(err){
            return error.get_globalError(err);
        }
    },

    async uploadGallery(req: Request, res: Response){
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

    async deleteAllGallery(req: Request, res: Response){
        const error = new ErrResHandler(res);
        const userAccess: JWTType = res.locals?.auth;
        
        try{
            if(allowAdminAccess(userAccess)){
                const galleries: GalleryType[] = await Gallery.findAll();
                await Gallery.destroy({
                    where: {}
                });
                
                await deleteImages(galleries)
                return res.status(200).json({message: SuccessMsgEnum.ALL_GALLERY_DELETED});
            }

            return error.get_401_unAuthorized();

        }catch(err){
            return error.get_globalError(err);
        }
    },

    async deleteOneGallery(req: Request, res: Response){
        const error = new ErrResHandler(res);
        const userAccess: JWTType = res.locals?.auth;
        const galleryId = Number(req.params.id);

        try{            
            if(!allowAdminAccess(userAccess)){
                const is_GalExistAndDeleted = await isGalleryExistAndDeleted(userAccess, galleryId)
                if(is_GalExistAndDeleted) return res.status(200).json({message: SuccessMsgEnum.GALLERY_DELETED});
                return error.get_401_galleryCantBeDeleted();
            }

            const _gallery = await Gallery.findOne({ where: {id: galleryId} });
            if(!_gallery) return error.get_404_galleryNotFound();
            await delGalleryByAdmin(_gallery);
            return res.status(200).json({message: SuccessMsgEnum.GALLERY_DELETED});
            
        }catch(err){
            return error.get_globalError(err);
        }
    },
}