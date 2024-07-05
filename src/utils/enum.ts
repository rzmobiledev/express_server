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
    USER_NOT_FOUND: "User Not Found!",
    EMAIL_ALREADY_REGISTERED: "This email is already registered.",
    ACCESS_DENIED: "Access Denied!",
    TOKEN_EXPIRED: "Your token expired.",
    PASSWORD_EMPTY: "Your password field should not empty",
});

export const UserLevelEnum = Object.freeze({
    SUPERADMIN: 1,
    ADMIN: 2,
    OPERATOR: 3,
    STAFF: 4
});