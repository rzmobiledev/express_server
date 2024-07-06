import { Request, Response } from "express";

import { 
    encryptUserPassword, 
    checkEmailifExists,
    isAllUserFieldsSatisfied,
    UserBodyParams,
    UserResponseObject,
    errorResHandler,
    ErrResHandler,
    SuccessResHandler,
} from '../utils/utils';

import * as ENUM from '../utils/enum';


const User = require("../models/").User;

module.exports = {

    async listUser(req: Request, res: Response){
        const error = new ErrResHandler(res);
        
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
        const error = new ErrResHandler(res);

        try{
            const user = await User.findByPk(userId);
            if(!user) return error.get_404_userNotFound();

            const userResponseObject = new UserResponseObject(user);
            return res.status(200).json(userResponseObject);

        } catch(err){
            return errorResHandler(res, err);
        }
    },

    async addUser(req: Request, res: Response): Promise<any>{
        const userParams = new UserBodyParams(req);
        const error = new ErrResHandler(res);
        const success = new SuccessResHandler(res);

        if(!isAllUserFieldsSatisfied(
            userParams.getFirstName(),
            userParams.getLastName(),
            userParams.getEmail(),
            userParams.getPassword()
        )){
            return error.get_400_fieldNotEmpty();
        }
        
        const userExists = await checkEmailifExists(userParams.getEmail());        

        if(userExists){
            return error.get_401_emailExist();
        }

        try{
            const _user: typeof User = await User.create(req.body);
            const hashed_password = await encryptUserPassword(userParams.getPassword());
            
            _user.password = hashed_password;
            _user.role = userParams.getRole();
            _user.active = userParams.getActive();
            _user.save();
            
            const userResponseObject = new UserResponseObject(_user)
            return success.get_201_userResObject(userResponseObject);

        } catch(err: any){
            return error.get_globalError(err);
        }
    },

    async changeUserProfile(req: Request, res: Response){
        const userParams = new UserBodyParams(req);
        const user_id = userParams.getUserId();
        const error = new ErrResHandler(res);
        const success = new SuccessResHandler(res);

        if(!isAllUserFieldsSatisfied(
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

            const hashed_password = await encryptUserPassword(userParams.getPassword());
            _user.firstName = userParams.getFirstName();
            _user.lastName = userParams.getLastName();
            _user.password = hashed_password;
            _user.save();

            const userResponseObject = new UserResponseObject(_user)
            return success.get_201_userResObject(userResponseObject);

        } catch(err){
            return error.get_globalError(err);
        }

    },

    async changePassword(req: Request, res: Response){
        const userParams = new UserBodyParams(req);
        const userId = userParams.getUserId();
        const error = new ErrResHandler(res);
        const success = new SuccessResHandler(res);

        if(!userParams.getPassword()){
            return error.get_405_passwdEmpty();
        }
        
        try{
            const _user: typeof User = await User.findByPk(userId);
            if(!_user) return error.get_404_userNotFound();
            
            const hashed_password = await encryptUserPassword(userParams.getPassword());
            _user.password = hashed_password;
            _user.save();

            return success.get_201_passwordUpdated();
            
        } catch(err){
            return errorResHandler(res, err);
        }
    },

    async softDeleteUser(req: Request, res: Response){
        const userParams = new UserBodyParams(req);
        const userId = userParams.getUserId();
        const error = new ErrResHandler(res);
        const success = new SuccessResHandler(res);

        const userExists = await User.findByPk(userId);
        if(!userExists) return error.get_404_userNotFound();
        
        try{
            
            User.destroy({
                where: {id: userId}
            });

            return success.get_200_userDeleted();


        }catch(err){
            return error.get_globalError(err);
        }
    }
}