import { Request, Response } from "express";

import { 
    encryptUserPassword, 
    checkUserifExists,
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

        const userExists = await checkUserifExists(userParams.getEmail());

        if(userExists){
            return res.status(401).send({message: ENUM.ErrorMsgEnum.EMAIL_ALREADY_REGISTERED});
        }

         return User
         .create(req.body)
         .then(async (user: typeof User) => {
            await encryptUserPassword(userParams.getPassword())
            .then((hash) => user.update({
                password: hash
            }))
            .then((user: typeof User) => res.status(200).json(user))
            .catch((err: Error) => res.status(400).send({message: err}));
         })
         .catch((err: typeof Error) => res.status(400).send(err))
    },

    changeUserProfile(req: Request, res: Response){
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

        return User
        .findByPk(user_id)
        .then(async (user: typeof User) => {
            if(!user) return res.status(404).json({message: ENUM.ErrorMsgEnum.USER_NOT_FOUND});
            return await encryptUserPassword(userParams.getPassword())
            .then((hash) => user.update({
                firstName: userParams.getFirstName(),
                lastName: userParams.getLastName(),
                password: hash
            }))
            .then(() => res.status(200).json(user))
            .catch(err => res.status(400).send(err))
        })
        .catch((err: typeof Error) => res.status(400).send(err))
    },

    async changePassword(req: Request, res: Response){
        const userParams = new UserBodyParams(req);
        const userId = userParams.getUserId();

        if(!userParams.getPassword()){
            return res.status(405).send({message: ENUM.ErrorMsgEnum.PASSWORD_EMPTY})
        }

        const userExists = await checkUserifExists(userParams.getUserId());
        if(!userExists) return res.status(404).send({message: ENUM.ErrorMsgEnum.USER_NOT_FOUND});
        
        return User.findByPk(userId)
        .then(async (user: typeof User) => {
            await encryptUserPassword(userParams.getPassword())
            .then((hashedPassword) => user.update({
                password: hashedPassword
                })
                .then(() => res.status(200).json(user))
            )
            .catch((err: typeof Error) => res.status(400).send(err))
        })
        .catch((err: typeof Error) => res.status(400).send(err));
    }
}