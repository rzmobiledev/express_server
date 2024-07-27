const { Sequelize } = require('sequelize');
import { DBEnum } from './enum';

const sequelize = new Sequelize(
    DBEnum.DBNAME,
    DBEnum.DBUSER,
    DBEnum.DBPASSWORD, {
        host: DBEnum.DBHOST,
        dialect: "postgres"
    }
);

const DbConnection = (ms: number) => new Promise((resolve, reject) => {
    const interval = setInterval(() => {
        const db_status: any = sequelize.authenticate();
        if(db_status){
            resolve(clearInterval(interval))
        } else {
            reject("connecting database. Waiting 3 seconds...")
        }
    }, ms)
});

export async function check_db_connection(){
    try{
        await DbConnection(3000)
    }catch(err){
        console.log(err)
    }
}

check_db_connection();