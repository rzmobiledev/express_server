require('dotenv').config();
import * as utils from '../utils/utils';

const User = require('../models').User
const Authlevel = require('../models').Authlevel;
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


async function createLevelAndUser(){

    await Authlevel.findAll()
    .then(async(data: typeof Authlevel) => {
        if(!data.length){
            await Authlevel.bulkCreate(UserLevel); 
        }
    })
    
    await User.findAll({where: { email: userPayload.email }})
    .then(async(data: typeof User) => {
        if(!data.length){
            const _user: typeof User = await User.create(userPayload);
            const hashed_password = await utils.encryptUserPassword(userPayload.password);
            await _user.update({
                password: hashed_password,
            })
        }
    })

    process.exit(0)
}

createLevelAndUser();
