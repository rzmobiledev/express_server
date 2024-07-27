require('dotenv').config();
import * as utils from '../utils/utils';

const User = require('../models').User
const AuthLevel = require('../models').Authlevel;
import { UserObjNoReadOnlyType } from "./type";


const userPayload: UserObjNoReadOnlyType = {
    firstName: String(process.env.USER_FIRSTNAME),
    lastName: String(process.env.USER_LASTNAME),
    username: String(process.env.USER_USERNAME),
    email: String(process.env.USER_EMAIL),
    password: String(process.env.USER_PASSWORD),
    id: 1,
    role: 1,
    active: false,
    createdAt: new Date(),
    updatedAt: new Date(),
}

const UserLevel = [
    { name: 'SuperAdmin', level: 1 },
    { name: 'Admin', level: 2 },
    {name : 'Operator', level: 3},
    {name: 'Staff', level: 4 },
];

async function createLEvel(){

    try{
        await AuthLevel.bulkCreate(UserLevel);            
        console.log('User level created.')
    }catch(err){
        console.log(err)
    }
}

async function createUser(){

    try{
        const roleLevel = await AuthLevel.findAll();
        if(!roleLevel) await AuthLevel.bulkCreate(UserLevel);
        
        const userExist: typeof User = await User.findAll({where: { id: userPayload.id, email: userPayload.email }})
        if(!userExist){
            const _user: typeof User = await User.create(userPayload);
            const hashed_password = await utils.encryptUserPassword(userPayload.password);
            _user.password = hashed_password;
            _user.role = userPayload.role;
            _user.active = userPayload.active;
            _user.save();
                
            console.log('User and level created sucessfuly!');
        }
        
       else{
         console.log('User and Role are already in database. Skip creating new one.');
       }

    }catch(err){
        console.log(err)
    }
}

createUser();
process.exit();