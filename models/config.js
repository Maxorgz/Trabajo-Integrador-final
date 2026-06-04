import 'dotenv/config';
import  {Sequelize} from "sequelize";

const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

export default sequelize;


try {
  await sequelize.authenticate();
     console.log('Connection has been established successfully.');
} catch (error) {
     console.error('Unable to connect to the database:', error);
}