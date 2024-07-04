import { Sequelize } from '@sequelize/core';
import { PostgresDialect } from '@sequelize/postgres';
import { DBEnum } from './enum';


export const sequelize = new Sequelize({
    dialect: PostgresDialect,
    database: DBEnum.DBNAME,
    user: DBEnum.DBUSER,
    password: DBEnum.DBPASSWORD,
    host: DBEnum.DBHOST,
    port: DBEnum.DBPORT,
    ssl: DBEnum.SSL,
    clientMinMessages: DBEnum.clientMinMessages
})

const DbConnection = (ms: number) => new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
        const db_status: any = await sequelize.authenticate();
        if(db_status){
            resolve(clearInterval(interval))
        } else {
            reject("connecting database. Waiting 1 seconds...")
        }
    }, ms)
});

export async function check_db_connection(){
    await DbConnection(1000)
    .then(() => console.log("Connected to database."))
    .catch((err) => console.log(err)
    );
}

check_db_connection();