import {Response, Request, request} from 'express';
import * as utils from '../utils/utils';

const AuthLevel = require('../models').Authlevel;


module.exports = {

    async getAllLevelsAccess(req: Request, res: Response){
        const error = new utils.ErrResHandler(res);
        
        try{
            const _level = await AuthLevel
            .findAll({
                include:[],
                order: [
                    ['createdAt', 'DESC']
                ]
            });

            return res.status(200).json(_level);

        }catch(err){
            return error.get_globalError(err);
        }
    },

    async createLevelAccessUser(req: Request, res: Response): Promise<any>{
        const success = new utils.LevelSuccessResHandler(res);
        const error = new utils.ErrResHandler(res);

        try{
            const _level: typeof AuthLevel = await AuthLevel.create(req.body);            
            const levelObj = new utils.AuthLevel(_level);
            return success.get_201_levelResObject(levelObj);

        } catch(err){
            return error.get_globalError(err);
        }
    },

    async getOneLevelAccess(req: Request, res: Response){
        const success = new utils.LevelSuccessResHandler(res);
        const error = new utils.ErrResHandler(res);
        const levelId = req.params.id
        console.log(req.params);
        
        try{
            const _level: typeof AuthLevel = await AuthLevel.findByPk(levelId);
            
            if(!_level) return error.get_404_levelNotFound();
            return success.get_201_levelResObject(_level);

        } catch(err){
            return error.get_globalError(err);
        }
    },

    async editLevelAccess(req: Request, res: Response){
        const success = new utils.LevelSuccessResHandler(res);
        const error = new utils.ErrResHandler(res);
        const levelId = req.params.id

        try{
            const _level: typeof AuthLevel = await AuthLevel.findByPk(levelId);
            
            if(!_level) return error.get_404_levelNotFound();
            _level.name = req.body.name;
            _level.level = req.body.level;
            _level.save();
            return success.get_201_levelResObject(_level);

        } catch(err){
            return error.get_globalError(err);
        }
    },

    async removeLevelAccess(req: Request, res: Response){
        const success = new utils.LevelSuccessResHandler(res);
        const error = new utils.ErrResHandler(res);
        const levelId = req.params.id;

        try{
            const _level: typeof AuthLevel = await AuthLevel.destroy({
                where: {id: levelId}
            });
            
            if(!_level) return error.get_404_levelNotFound();
            return success.get_200_levelDeleted();

        }catch(err){
            return error.get_globalError(err);
        }
    }

}