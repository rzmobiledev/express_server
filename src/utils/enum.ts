import dotenv from 'dotenv';
dotenv.config();

export const DBEnum = Object.freeze({
    DBHOST: String(process.env.DBHOST),
    DBNAME: String(process.env.DBNAME),
    DBPORT: Number(process.env.DBPORT),
    DBUSER: String(process.env.DBUSER),
    DBPASSWORD: String(process.env.DBPASSWORD),
    SSL: Boolean(process.env.SSL),
    clientMinMessages: 'notice',
})

export const PasswordEnum = Object.freeze({
    SALT_GENERATED: String(process.env.SALT_GENERATED),
    MIN_PASSWORD_LENGTH : 6,
    SECRET_KEY: String(process.env.SECRET_KEY),
});

export const ErrorMsgEnum = Object.freeze({
    FIELD_SHOULDNOT_EMPTY: "Make sure all fields not empty!",
    ID_NOT_FOUND: "ID Not Found!",
    ARTICLE_NOT_FOUND: "Article not found",
    CATEGORY_NOT_FOUND: "Category not found",
    GALLERY_NOT_FOUND: "Gallery not found",
    NO_FILE_FOUND: "No files found. At least upload one file.",
    GALLERY_CANTBE_DELETED: "Gallery not found or you are not authorized to delete.",
    EMAIL_ALREADY_REGISTERED: "This email is already registered.",
    ACCESS_DENIED: "Access Denied!",
    TOKEN_EXPIRED: "Your token expired.",
    PASSWORD_EMPTY: "Your password field should not empty",
    URL_NOT_EXISTS: "URL not exists",
    SOFT_DELETED_DETECT: "This email already exists in database and has soft deletion",
    LEVEL_NOT_FOUND: "Level not found!",
    LEVEL_EXISTS: "This level exists in database",
    UNKNOWN_ERROR: 'Unknown Error. Report to admin.',
    COMPARING_PASSWDERROR: 'Error comparing password.',
    PASSWORD_NOT_MATCH: 'Password does not match',
    UNAUTHORIZED: 'You are unauthorized!',
    SUPERUSER_ONLY: 'You cannot update Superuser role.',
    ROLE_UNAVAILABLE: 'Role level is not available. Choose other roles.'

});

export const SuccessMsgEnum = Object.freeze({
    PASSWORD_UPDATED: 'Your password has changed.',
    USER_DELETED: 'User deleted.',
    CATEGORY_DELETED: 'Category deleted.',
    LEVEL_UPDATED: 'Level updated.',
    LEVEL_DELETED: 'Level deleted.',
    ARTICLE_DELETED: 'Article deleted.',
    GALLERY_DELETED: 'Gallery deleted.',
    ALL_GALLERY_DELETED: 'All galleries completely deleted.'
})

export const UserLevelEnum = Object.freeze({
    SUPERADMIN: 1,
    ADMIN: 2,
    OPERATOR: 3,
    STAFF: 4
});