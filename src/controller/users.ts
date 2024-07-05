import { Request, Response } from "express";

import { 
    encryptUserPassword, 
    checkEmailifExists,
    isAllUserFieldsSatisfied,
    UserBodyParams,
    UserResponseObject,
} from '../utils/utils';

import * as ENUM from '../utils/enum';
import { SequelizeErrorType } from "../utils/type";

const User = require("../models/").User;

module.exports = {

    listUser(req: Request, res: Response){
        return User
        .findAll({
            include:[],
            order: [
                ['createdAt', 'DESC']
            ]
        })
        .then((user: typeof User) => res.status(200).json(user))
        .catch((err: typeof Error) => res.status(400).send(err));
    },

    async getUser(req: Request, res: Response){
        const userId = req.params.id
        
        try{
            const user = await User.findByPk(userId);
            if(!user) return res.status(404).json({message: ENUM.ErrorMsgEnum.USER_NOT_FOUND});

            const userResponseObject = new UserResponseObject(user);
            return res.status(200).json(userResponseObject);

        } catch(err){
            return res.status(400).json({message: ENUM.ErrorMsgEnum.URL_NOT_EXISTS})
        }
    },

    async addUser(req: Request, res: Response): Promise<any>{
        const userParams = new UserBodyParams(req);

        if(!isAllUserFieldsSatisfied(
            userParams.getFirstName(),
            userParams.getLastName(),
            userParams.getEmail(),
            userParams.getPassword()
        )){
            return res.status(400).send({message: ENUM.ErrorMsgEnum.FIELD_SHOULDNOT_EMPTY});
        }
        
        const userExists = await checkEmailifExists(userParams.getEmail());        

        if(userExists){
            return res.status(401).send({message: ENUM.ErrorMsgEnum.EMAIL_ALREADY_REGISTERED});
        }

        try{
            const _user: typeof User = await User.create(req.body);
            const hashed_password = await encryptUserPassword(userParams.getPassword());
            
            _user.password = hashed_password;
            _user.role = userParams.getRole();
            _user.active = userParams.getActive();
            _user.save();
            
            const userResponseObject = new UserResponseObject(_user)
            return res.status(201).json(userResponseObject)
        } catch(err: any){
            if('errors' in err) return res.status(400).send({message: ENUM.ErrorMsgEnum.SOFT_DELETED_DETECT});
            return res.status(400).send(err);

        }
    },

    async changeUserProfile(req: Request, res: Response){
        const userParams = new UserBodyParams(req);
        const user_id = userParams.getUserId();

        if(!isAllUserFieldsSatisfied(
            userParams.getFirstName(),
            userParams.getLastName(),
            userParams.getEmail(),
            userParams.getPassword()
        ))
        {
            return res.status(400).send({message: ENUM.ErrorMsgEnum.FIELD_SHOULDNOT_EMPTY});
        }
        
        try{
            const _user: typeof User = await User.findByPk(user_id);
            if(!_user) return res.status(404).json({message: ENUM.ErrorMsgEnum.USER_NOT_FOUND});

            const hashed_password = await encryptUserPassword(userParams.getPassword());
            _user.firstName = userParams.getFirstName();
            _user.lastName = userParams.getLastName();
            _user.password = hashed_password;
            _user.save();

            const userResponseObject = new UserResponseObject(_user)
            return res.status(201).json(userResponseObject)

        } catch(err){
            res.status(400).send({message: ENUM.ErrorMsgEnum.URL_NOT_EXISTS});
        }

    },

    async changePassword(req: Request, res: Response){
        const userParams = new UserBodyParams(req);
        const userId = userParams.getUserId();

        if(!userParams.getPassword()){
            return res.status(405).send({message: ENUM.ErrorMsgEnum.PASSWORD_EMPTY})
        }

        const userExists = await checkEmailifExists(userParams.getEmail());
        if(!userExists) return res.status(404).send({message: ENUM.ErrorMsgEnum.USER_NOT_FOUND});
        
        try{
            const _user: typeof User = await User.findByPk(userId);
            if(!_user) return res.status(404).json({message: ENUM.ErrorMsgEnum.USER_NOT_FOUND});
            
            const hashed_password = await encryptUserPassword(userParams.getPassword());
            _user.password = hashed_password;
            _user.save();

            return res.status(201).json({message: ENUM.SuccessMsgEnum.PASSWORD_UPDATED})
            
        } catch(err){
            res.status(400).send({message: ENUM.ErrorMsgEnum.URL_NOT_EXISTS});
        }
    },

    async softDeleteUser(req: Request, res: Response){
        const userParams = new UserBodyParams(req);
        const userId = userParams.getUserId();

        const userExists = await checkEmailifExists(userParams.getEmail());
        if(!userExists) {
            return res.status(404).json({message: ENUM.ErrorMsgEnum.USER_NOT_FOUND})
        }
        
        try{
            
            User.destroy({
                where: {id: userId}
            });

            return res.status(200).json({message: ENUM.SuccessMsgEnum.USER_DELETED})


        }catch(err){
            res.status(400).send({message: ENUM.ErrorMsgEnum.URL_NOT_EXISTS});
        }
    }
}