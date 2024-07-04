import { UserObjectType, ObjectType } from '../src/utils/type';
const SequelizeMock = require('sequelize-mock');
const dbMock = new SequelizeMock();
import { 
    encryptUserPassword, 
    checkUserifExists,
    isAllUserFieldsSatisfied,
    UserBodyParams,
} from '../src/utils/utils';

require('dotenv').config();

export const userPayload: UserObjectType = {
    firstName: 'Rizal',
    lastName: 'Safrizal',
    username: 'rizal',
    email: 'rzmobiledev@gmail.com',
    password: 'xxxxxxx',
    id: 3
}

export const userPayloadWrong: UserObjectType = {
    firstName: 'Rizal',
    lastName: 'Safrizal',
    username: 'rizal',
    email: '',
    password: 'xxxxxxx',
    id: 3
}

export const UserMock = dbMock.define('user', userPayload, {
    instanceMethods: {
        getFullName: function(){
            return this.get('firstName') + ' '+ this.get('lastName');
        }
    }
})

export const PasswordEnumTest = Object.freeze({
    HASHED_PASSWORD: 'hashingpasword12#$7x88x'
})

const EndpointsEnum = Object.freeze({
    HOME: `http://${String(process.env.HOST)}:${Number(process.env.PORT)}` || 'http://localhost:5000',
    ALLUSERS: `http://${String(process.env.HOST)}:${Number(process.env.PORT)}/api/users`,
});

export const GenTokenEnum = Object.freeze({
    GENERATED_TOKEN: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiJyem1vYmlsZWRldkBnbWFpbC5jb20iLCJpYXQiOjE3MTk5OTY1MTMsImV4cCI6MTcxOTk5ODMxM30.EDj_G2JzF8QcUtCdry22WawDamrFEfE_NpTHkXvIRnQ',
    WRONG_TOKEN: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
})

async function GetEndpointResponse(url: string) {
    return new Promise(async (resolve, reject) => {
        const response = await fetch(url);
        if(!response.ok){
            reject(`Response status: ${response.status}`);
        } else {
            resolve(response.json())
        }
    })
}

function PostEndpointResponse(url: string, method: string, payload: UserObjectType){
    return fetch(url, {
            method: method.toUpperCase(),
            body: JSON.stringify(payload),
            headers: {
                "Content-Type": "application/json; charset=UTF-8"
            }
        })
        .then(data => data.json())
        .catch(err => err)
}

export async function getHomepage(){
    return GetEndpointResponse(EndpointsEnum.HOME);
}

export async function showAllUsers(){
    return GetEndpointResponse(EndpointsEnum.ALLUSERS);
}

export async function createAUser(payload: UserObjectType){
    return PostEndpointResponse(EndpointsEnum.ALLUSERS, 'POST', payload);
}

export async function updateUser(userId: number, payload: UserObjectType){
    return PostEndpointResponse(EndpointsEnum.ALLUSERS+'/'+userId, 'PUT', payload)
}

export async function changeUserProfile(userId: number, payload: UserObjectType){
    return PostEndpointResponse(EndpointsEnum.ALLUSERS+'/'+userId, 'PUT', payload)
}

export async function changeUserPassword(userId: number, payload: UserObjectType){
    return await PostEndpointResponse(EndpointsEnum.ALLUSERS+'/'+userId+'/password', 'PUT', payload)
}

export function userFetchMock(): Promise<Response> {
    return new Promise((resolve, reject) => {
        resolve({
            ok: true,
            status: 201,
            json: async () => userPayload  
        } as Response)
    })
}

export function hashedPasswordMock(): Promise<string> {
    return Promise.resolve(PasswordEnumTest.HASHED_PASSWORD);
}
