require('dotenv').config();
import { SuccessMsgEnum } from '../src/utils/enum';
import { UserObjNoReadOnlyType, LevelAccessNoIdNoReadonlyType, ArticleFieldNoIdNoRoType, CategoryNoIdType, UserLoginType, JWTType, GalleryHttpResponseType } from '../src/utils/type';
import { EncodeDecodeJWTToken } from '../src/utils/utils';
const SequelizeMock = require('sequelize-mock');
const dbMock = new SequelizeMock();

const User = require("../src/models/").User;
require('dotenv').config();

export const loginPayload: UserLoginType = {
    email: String(process.env.USER_EMAIL),
    password: String(process.env.USER_PASSWORD)
}

export const userPayload: UserObjNoReadOnlyType = {
    firstName: String(process.env.USER_FIRSTNAME),
    lastName: String(process.env.USER_LASTNAME),
    username: String(process.env.USER_USERNAME),
    email: String(process.env.USER_EMAIL),
    password: String(process.env.USER_PASSWORD),
    id: 1,
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
    userId: 5,
    categoryId: 1,
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

export const successGalleryHttpResponse: GalleryHttpResponseType[] = [
        {
          id: 49,
          name: '1721478932031-994797179-tester.png',
          userId: 1,
          articleId: null,
          createdAt: '2024-07-20T12:35:32.032Z',
          updatedAt: '2024-07-20T12:35:32.032Z'
        }
    ]

const EndpointsEnum = Object.freeze({
    HOME: `http://${String(process.env.HOST)}:${Number(process.env.PORT)}` || 'http://localhost:5000',
    ALLUSERS: `http://${String(process.env.HOST)}:${Number(process.env.PORT)}/api/users`,
    LEVELS: `http://${String(process.env.HOST)}:${Number(process.env.PORT)}/api/levelauth`,
    ARTICLES: `http://${String(process.env.HOST)}:${Number(process.env.PORT)}/api/article`,
    CATEGORY: `http://${String(process.env.HOST)}:${Number(process.env.PORT)}/api/category`,
    GALLERY: `http://${String(process.env.HOST)}:${Number(process.env.PORT)}/api/gallery`,
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

async function generateRealJWTToken(){
    const data_to_encode: JWTType = {
       id: userPayload.id, email: userPayload.email, level: userPayload.role
    }
    const generate_token = new EncodeDecodeJWTToken(data_to_encode);
    const token = generate_token.generateJWTToken(30);
    return token
} 

async function fetchJsonResponse(url: string, method: string, payload?: UserObjNoReadOnlyType | LevelAccessNoIdNoReadonlyType | ArticleFieldNoIdNoRoType | CategoryNoIdType | UserLoginType | FormData | null){
    const jwtToken = await generateRealJWTToken();
    return fetch(url, {
            method: method.toUpperCase(),
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
                'Authorization': `Bearer ${jwtToken}`, 
            }
        })
        .then(data => data.json())
        .catch(err => err)
}

async function fetchFormDataResponse(url: string, method: string, payload?: FormData | null){
    const jwtToken = await generateRealJWTToken();
    return fetch(url, {
            method: method.toUpperCase(),
            body: payload,
            headers: {
                'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
                'Authorization': `Bearer ${jwtToken}`, 
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
    return await fetchJsonResponse(EndpointsEnum.ALLUSERS, 'POST', payload);
}

export async function updateUser(userId: number, payload: UserObjNoReadOnlyType){
    return await fetchJsonResponse(EndpointsEnum.ALLUSERS+'/'+userId, 'PUT', payload)
}

export async function changeUserProfile(userId: number, payload: UserObjNoReadOnlyType){
    return await fetchJsonResponse(EndpointsEnum.ALLUSERS+'/'+userId, 'PUT', payload)
}

export async function changeUserPassword(userId: number, payload: UserObjNoReadOnlyType){
    return await fetchJsonResponse(EndpointsEnum.ALLUSERS+'/'+userId+'/password', 'PUT', payload)
}

export async function sofDeleteUser(userId: number){
    return await fetchJsonResponse(EndpointsEnum.ALLUSERS+'/'+userId, 'DELETE');
}

export async function hardDeleteUser(userId: number, payload: UserObjNoReadOnlyType){
    return await fetchJsonResponse(EndpointsEnum.ALLUSERS+'/user/'+userId, 'DELETE', payload);
}

export async function createLevelAccessUser(payload: LevelAccessNoIdNoReadonlyType){    
    return await fetchJsonResponse(EndpointsEnum.LEVELS, 'POST', payload)
}

export async function assignLevelAccessToUser(payload: UserObjNoReadOnlyType){
    return await fetchJsonResponse(EndpointsEnum.ALLUSERS+'/levelauth', 'POST', payload)
}

export async function changeLevelAccessUser(levelId: number, payload: LevelAccessNoIdNoReadonlyType){
    return await fetchJsonResponse(EndpointsEnum.LEVELS+'/'+levelId, 'PUT', payload)
}

export async function removeLevelAccessUser(levelId: number, payload: LevelAccessNoIdNoReadonlyType){
    return await fetchJsonResponse(EndpointsEnum.LEVELS+'/'+levelId, 'DELETE', payload);
}

export async function getOneLevelAccess(levelId: number, payload: LevelAccessNoIdNoReadonlyType){
    return await GetEndpointResponse(EndpointsEnum.LEVELS+'/'+levelId);
}

export async function createNewArticle(payload: ArticleFieldNoIdNoRoType){
    return await fetchJsonResponse(EndpointsEnum.ARTICLES, 'POST', payload);
}

export async function updateArticle(levelId: number, payload: ArticleFieldNoIdNoRoType){
    return await fetchJsonResponse(EndpointsEnum.ARTICLES+'/'+levelId, 'PUT', payload);
}

export async function getAllArticles(){
    return await GetEndpointResponse(EndpointsEnum.ARTICLES);
}

export async function getOneArticle(articleId: number){
    return await GetEndpointResponse(EndpointsEnum.ARTICLES+'/'+articleId);
}

export async function deleteArticle(levelId: number, payload: ArticleFieldNoIdNoRoType){
    return await fetchJsonResponse(EndpointsEnum.ARTICLES+'/'+levelId, 'DELETE', payload);
}

export async function createCategory(payload: CategoryNoIdType){
    return await fetchJsonResponse(EndpointsEnum.CATEGORY, 'POST', payload);
}

export async function getCategById(categId: number){
    return await GetEndpointResponse(EndpointsEnum.CATEGORY+'/'+categId);
}

export async function getAllCategories(){
    return await GetEndpointResponse(EndpointsEnum.CATEGORY);
}

export function hashedPasswordMock(): Promise<string> {
    return Promise.resolve(PasswordEnumTest.HASHED_PASSWORD);
}

export async function updateCategory(categId: number, payload: CategoryNoIdType){
    return await fetchJsonResponse(EndpointsEnum.CATEGORY+'/'+categId, 'PUT', payload);
}

export async function deleteCategory(categId: number, payload: CategoryNoIdType){
    return await fetchJsonResponse(EndpointsEnum.CATEGORY+'/'+categId, 'DELETE', payload);
}

export async function loginUser(payload: UserLoginType){
    return await fetchJsonResponse(EndpointsEnum.ALLUSERS+'/login', 'POST', payload)
}

export async function uploadGallery(payload: FormData | null){
    return await fetchFormDataResponse(EndpointsEnum.GALLERY, 'POST', payload)
}

export async function deleteGallery(galleryId: number){
    return await fetchJsonResponse(EndpointsEnum.GALLERY+'/'+galleryId, 'DELETE')
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

export function createImageUploadResponse(){
    return globalResponse(successGalleryHttpResponse)
}