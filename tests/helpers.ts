import { SuccessMsgEnum } from '../src/utils/enum';
import { UserObjNoReadOnlyType } from '../src/utils/type';
const SequelizeMock = require('sequelize-mock');
const dbMock = new SequelizeMock();


require('dotenv').config();

export const userPayload: UserObjNoReadOnlyType = {
    firstName: 'Rizal',
    lastName: 'Safrizal',
    username: 'rizal',
    email: 'rzmobiledev@gmail.com',
    password: 'password1234',
    id: 3,
    role: 0,
    active: false,
    createdAt: new Date(),
    updatedAt: new Date()
}

export const userPayloadWrong: UserObjNoReadOnlyType = {
    firstName: 'Rizal',
    lastName: 'Safrizal',
    username: 'rizal',
    email: '',
    password: 'xxxxxxx',
    id: 3,
    role: 0,
    active: false,
    createdAt: new Date(),
    updatedAt: new Date()
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

function PostEndpointResponse(url: string, method: string, payload: UserObjNoReadOnlyType){
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

export async function getUserProfile(userId: number){
    return GetEndpointResponse(EndpointsEnum.ALLUSERS+'/'+userId);
}

export async function showAllUsers(){
    return GetEndpointResponse(EndpointsEnum.ALLUSERS);
}

export async function createAUser(payload: UserObjNoReadOnlyType){
    return PostEndpointResponse(EndpointsEnum.ALLUSERS, 'POST', payload);
}

export async function updateUser(userId: number, payload: UserObjNoReadOnlyType){
    return PostEndpointResponse(EndpointsEnum.ALLUSERS+'/'+userId, 'PUT', payload)
}

export async function changeUserProfile(userId: number, payload: UserObjNoReadOnlyType){
    return PostEndpointResponse(EndpointsEnum.ALLUSERS+'/'+userId, 'PUT', payload)
}

export async function changeUserPassword(userId: number, payload: UserObjNoReadOnlyType){
    return await PostEndpointResponse(EndpointsEnum.ALLUSERS+'/'+userId+'/password', 'PUT', payload)
}

export async function deleteUser(userId: number, payload){
    return PostEndpointResponse(EndpointsEnum.ALLUSERS+'/'+userId, 'DELETE', payload);
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

export function deletedUser(): Promise<Response> {
    return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => SuccessMsgEnum.USER_DELETED
    } as Response)
}