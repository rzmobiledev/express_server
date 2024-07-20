import { Request, Response } from "express";
import * as utils from '../utils/utils';
const User = require("../models/").User;

module.exports = {

    async listUser(req: Request, res: Response){
        const error = new utils.ErrResHandler(res);
        try{
            const _user = await User
            .findAll({
                attributes: {exclude: ['password', 'deletedAt']},
                include:[],
                order: [
                    ['createdAt', 'DESC']
                ]
            });

            return res.status(200).json(_user);

        }catch(err){
            return error.get_globalError(err);
        }
    },

    async getUser(req: Request, res: Response){
        const userId = req.params.id
        const error = new utils.ErrResHandler(res);

        try{
            const user = await User.findByPk(userId);
            if(!user) return error.get_404_userNotFound();

            const userResponseObject = new utils.UserResponseObject(user);
            return res.status(200).json(userResponseObject);

        } catch(err){
            return error.get_globalError(err);
        }
    },

    async addUser(req: Request, res: Response): Promise<any>{
        const userParams = new utils.UserBodyParams(req);
        const error = new utils.ErrResHandler(res);
        const success = new utils.UserSuccessResHandler(res);
        
        if(!utils.isAllUserFieldsSatisfied(
            userParams.getFirstName(),
            userParams.getLastName(),
            userParams.getEmail(),
            userParams.getPassword()
        )){
            return error.get_400_fieldNotEmpty();
        }
        
        const userExists = await utils.checkEmailifExists(userParams.getEmail());        

        if(userExists){
            return error.get_401_emailExist();
        }

        try{
            const _user: typeof User = await User.create(req.body);
            const hashed_password = await utils.encryptUserPassword(userParams.getPassword());
            
            _user.password = hashed_password;
            _user.role = userParams.getRole();
            _user.active = userParams.getActive();
            _user.save();
            
            const userResponseObject = new utils.UserResponseObject(_user)
            return success.get_201_userResObject(userResponseObject);

        } catch(err: any){
            return error.get_globalError(err);
        }
    },

    async changeUserProfile(req: Request, res: Response){
        const userParams = new utils.UserBodyParams(req);
        const user_id = userParams.getUserId();
        const error = new utils.ErrResHandler(res);
        const success = new utils.UserSuccessResHandler(res);

        if(!utils.isAllUserFieldsSatisfied(
            userParams.getFirstName(),
            userParams.getLastName(),
            userParams.getEmail(),
            userParams.getPassword()
        ))
        {
            return error.get_400_fieldNotEmpty();
        }
        
        try{
            const _user: typeof User = await User.findByPk(user_id);
            if(!_user) return error.get_404_userNotFound();

            const hashed_password = await utils.encryptUserPassword(userParams.getPassword());
            _user.firstName = userParams.getFirstName();
            _user.lastName = userParams.getLastName();
            _user.password = hashed_password;
            _user.role = userParams.getRole();
            _user.save();

            const userResponseObject = new utils.UserResponseObject(_user)
            return success.get_201_userResObject(userResponseObject);

        } catch(err){
            return error.get_globalError(err);
        }

    },

    async changePassword(req: Request, res: Response){
        const userParams = new utils.UserBodyParams(req);
        const userId = userParams.getUserId();
        const error = new utils.ErrResHandler(res);
        const success = new utils.UserSuccessResHandler(res);

        if(!userParams.getPassword()){
            return error.get_405_passwdEmpty();
        }
        
        try{
            const _user: typeof User = await User.findByPk(userId);
            if(!_user) return error.get_404_userNotFound();
            
            const hashed_password = await utils.encryptUserPassword(userParams.getPassword());
            _user.password = hashed_password;
            _user.save();

            return success.get_201_passwordUpdated();
            
        } catch(err){
            return error.get_globalError(err);
        }
    },

    async softDeleteUser(req: Request, res: Response){
        const userParams = new utils.UserBodyParams(req);
        const userId = userParams.getUserId();
        const error = new utils.ErrResHandler(res);
        const success = new utils.UserSuccessResHandler(res);
        
        try{
            
            const userExists = await User.destroy({
                where: {id: userId}
            });

            if(!userExists) return error.get_404_userNotFound();
            return success.get_200_userDeleted();


        }catch(err){
            return error.get_globalError(err);
        }
    },

    async hardDeleteUser(req: Request, res: Response){
        const userParams = new utils.UserBodyParams(req);
        const userId = userParams.getUserId();
        const error = new utils.ErrResHandler(res);
        const success = new utils.UserSuccessResHandler(res);
        
        try{
            const userExists = await User.destroy({
                where: {id: userId},
                force: true,
            });
            
            if(!userExists) return error.get_404_userNotFound();
            return success.get_200_userDeleted();

        }catch(err){
            return error.get_globalError(err);
        }
    },

    async login(req: Request, res: Response){
        const error = new utils.ErrResHandler(res);
        try{
            if(!req.body.email && !req.body.password) {
                return res.status(400).json({message: error.get_400_fieldNotEmpty})
            }
            
            return await utils.compareUserPassword(req, res);
        }catch(err){
            return error.get_globalError(err);
        }
    }

}