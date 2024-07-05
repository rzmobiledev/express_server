import { Request, Response } from "express";

import { 
    encryptUserPassword, 
    checkEmailifExists,
    isAllUserFieldsSatisfied,
    UserBodyParams,
} from '../utils/utils';

import * as ENUM from '../utils/enum';

const User = require("../models/").User;

module.exports = {

    list(req: Request, res: Response){
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
            console.log(hashed_password);
            
            _user.update({
                password: hashed_password,
                role: userParams.getRole(),
                active: userParams.getActive()
            });
            return res.status(201).json(_user)
        } catch(err){
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
            _user.update({
                firstName: userParams.getFirstName(),
                lastName: userParams.getLastName(),
                password: hashed_password
            });
            
            return res.status(201).json(_user)

        } catch(err){
            res.status(400).send(err);
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
            _user.update({
                password: hashed_password
            })
            return res.status(201).json(_user)
            
        } catch(err){
            res.status(400).send(err);
        }

    }
}