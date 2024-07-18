require('dotenv').config();
import { SuccessMsgEnum } from '../src/utils/enum';
import { UserObjNoReadOnlyType, LevelAccessNoIdNoReadonlyType, ArticleFieldNoIdNoRoType, CategoryNoIdType, UserLoginType } from '../src/utils/type';
const SequelizeMock = require('sequelize-mock');
const dbMock = new SequelizeMock();


require('dotenv').config();

export const loginPayload: UserLoginType = {
    email: String(process.env.USER_EMAIL),
    password: String(process.env.USER_PASSWORD)
}

export const userPayload: UserObjNoReadOnlyType = {
    firstName: 'Iva',
    lastName: 'Izazaya',
    username: 'iva',
    email: 'iva@gmail.com',
    password: 'maruco',
    id: 3,
    role: 3,
    active: false,
    createdAt: new Date(),
    updatedAt: new Date(),
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
    updatedAt: new Date(),
}

export const articlePayload: ArticleFieldNoIdNoRoType = {
    userId: 3,
    categoryId: 2,
    title: 'Writing First Articles',
    subtitle: 'This is called initial commit',
    description: 'The first time we wrote article on this website',
    tags: [
        {
            name: 'blog',
        },
        {
            name: 'twitter',
        },
        {
            name: 'newspaper',
        },
        {
            name: 'articles',
        },
        {
            name: 'investigation',
        }
    ],
    
}

export const categoryPayload: CategoryNoIdType = { name: 'news'}

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

export const LevelPayload : LevelAccessNoIdNoReadonlyType = {
        name: 'Staff',
        level: 4
}

export const ListLevelPayload: LevelAccessNoIdNoReadonlyType[] = [
    {
        name: 'SuperAdmin',
        level: 1
    },
    {
        name: 'Admin',
        level: 2
    },
    {
        name: 'Operator',
        level: 3
    },
    {
        name: 'Staff',
        level: 4
    }
]

const EndpointsEnum = Object.freeze({
    HOME: `http://${String(process.env.HOST)}:${Number(process.env.PORT)}` || 'http://localhost:5000',
    ALLUSERS: `http://${String(process.env.HOST)}:${Number(process.env.PORT)}/api/users`,
    LEVELS: `http://${String(process.env.HOST)}:${Number(process.env.PORT)}/api/levelauth`,
    ARTICLES: `http://${String(process.env.HOST)}:${Number(process.env.PORT)}/api/article`,
    CATEGORY: `http://${String(process.env.HOST)}:${Number(process.env.PORT)}/api/category`,
});

export const GenTokenEnum = Object.freeze({
    GENERATED_TOKEN: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiJyem1vYmlsZWRldkBnbWFpbC5jb20iLCJpYXQiOjE3MTk5OTY1MTMsImV4cCI6MTcxOTk5ODMxM30.EDj_G2JzF8QcUtCdry22WawDamrFEfE_NpTHkXvIRnQ',
    WRONG_TOKEN: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
})

async function GetEndpointResponse(url: string) {
    return new Promise(async (resolve, reject) => {
        const response = await fetch(url);
        
        if(!response.ok){
            reject(`Response status: ${response}`);
       } else {
            resolve(response.json())
        }
    });
}

function PostEndpointResponse(url: string, method: string, payload?: UserObjNoReadOnlyType | LevelAccessNoIdNoReadonlyType | ArticleFieldNoIdNoRoType | CategoryNoIdType | UserLoginType){
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

export async function sofDeleteUser(userId: number){
    return PostEndpointResponse(EndpointsEnum.ALLUSERS+'/'+userId, 'DELETE');
}

export async function hardDeleteUser(userId: number, payload: UserObjNoReadOnlyType){
    return PostEndpointResponse(EndpointsEnum.ALLUSERS+'/user/'+userId, 'DELETE', payload);
}

export async function createLevelAccessUser(payload: LevelAccessNoIdNoReadonlyType){    
    return PostEndpointResponse(EndpointsEnum.LEVELS, 'POST', payload)
}

export async function assignLevelAccessToUser(payload: UserObjNoReadOnlyType){
    return PostEndpointResponse(EndpointsEnum.ALLUSERS+'/levelauth', 'POST', payload)
}

export async function changeLevelAccessUser(levelId: number, payload: LevelAccessNoIdNoReadonlyType){
    return PostEndpointResponse(EndpointsEnum.LEVELS+'/'+levelId, 'PUT', payload)
}

export async function removeLevelAccessUser(levelId: number, payload: LevelAccessNoIdNoReadonlyType){
    return PostEndpointResponse(EndpointsEnum.LEVELS+'/'+levelId, 'DELETE', payload);
}

export async function getOneLevelAccess(levelId: number, payload: LevelAccessNoIdNoReadonlyType){
    return GetEndpointResponse(EndpointsEnum.LEVELS+'/'+levelId);
}

export async function createNewArticle(payload: ArticleFieldNoIdNoRoType){
    return PostEndpointResponse(EndpointsEnum.ARTICLES, 'POST', payload);
}

export async function updateArticle(levelId: number, payload: ArticleFieldNoIdNoRoType){
    return PostEndpointResponse(EndpointsEnum.ARTICLES+'/'+levelId, 'PUT', payload);
}

export async function getAllArticles(){
    return GetEndpointResponse(EndpointsEnum.ARTICLES);
}

export async function getOneArticle(articleId: number){
    return GetEndpointResponse(EndpointsEnum.ARTICLES+'/'+articleId);
}

export async function deleteArticle(levelId: number, payload: ArticleFieldNoIdNoRoType){
    return PostEndpointResponse(EndpointsEnum.ARTICLES+'/'+levelId, 'DELETE', payload);
}

export async function createCategory(payload: CategoryNoIdType){
    return PostEndpointResponse(EndpointsEnum.CATEGORY, 'POST', payload);
}

export async function getCategById(categId: number){
    return GetEndpointResponse(EndpointsEnum.CATEGORY+'/'+categId);
}

export async function getAllCategories(){
    return GetEndpointResponse(EndpointsEnum.CATEGORY);
}

export function hashedPasswordMock(): Promise<string> {
    return Promise.resolve(PasswordEnumTest.HASHED_PASSWORD);
}

export async function updateCategory(categId: number, payload: CategoryNoIdType){
    return PostEndpointResponse(EndpointsEnum.CATEGORY+'/'+categId, 'PUT', payload);
}

export async function deleteCategory(categId: number, payload: CategoryNoIdType){
    return PostEndpointResponse(EndpointsEnum.CATEGORY+'/'+categId, 'DELETE', payload);
}

export async function loginUser(payload: UserLoginType){
    return PostEndpointResponse(EndpointsEnum.ALLUSERS+'/login', 'POST', payload)
}

const globalResponse = (payload: any): Promise<Response> => {
    return Promise.resolve({
        ok: true,
        json: async() => payload
    } as Response)
}

export function userFetchMock(): Promise<Response>{
    return globalResponse(userPayload);
}

export function deletedUser(): Promise<Response> {
    return globalResponse(SuccessMsgEnum.USER_DELETED);
}

export function deleteLevelResponse(){
    return globalResponse({message: SuccessMsgEnum.LEVEL_DELETED});
}

export function createArticleResponse(){
    return globalResponse(articlePayload);
}

export function createCategoryResponse(){
    return globalResponse(categoryPayload);
}

export function generateTokenResponse(){
    return globalResponse(GenTokenEnum.GENERATED_TOKEN);
}