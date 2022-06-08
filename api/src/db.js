require('dotenv').config();
const { Sequelize, Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const {
    DB_USER, DB_PASSWORD, DB_HOST, DB_NAME } = process.env;
let sequelize =
    process.env.NODE_ENV === "production"
        ? new Sequelize({
            database: DB_NAME,
            dialect: "postgres",
            host: DB_HOST,
            port: 5432,
            username: DB_USER,
            password: DB_PASSWORD,
            pool: {
                max: 3,
                min: 1,
                idle: 10000,
            },
            dialectOptions: {
                ssl: {
                    require: true,
                    // Ref.: https://github.com/brianc/node-postgres/issues/2009
                    rejectUnauthorized: false,
                },
                keepAlive: true,
            },
            ssl: true,
        })
        : new Sequelize(
            `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/henryoverflow`,
            { logging: false, native: false }
        );
// const sequelize = new Sequelize(`postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/pokemon`, {
//   logging: false, // set to console.log to see the raw SQL queries
//   native: false, // lets Sequelize know we can use pg-native for ~30% more speed
// });
const basename = path.basename(__filename);

const modelDefiners = [];

// Leemos todos los archivos de la carpeta Models, los requerimos y agregamos al arreglo modelDefiners
fs.readdirSync(path.join(__dirname, '/models'))
    .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
    .forEach((file) => {
        modelDefiners.push(require(path.join(__dirname, '/models', file)));
    });

// Injectamos la conexion (sequelize) a todos los modelos
modelDefiners.forEach(model => model(sequelize));
// Capitalizamos los nombres de los modelos ie: product => Product
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [entry[0][0].toUpperCase() + entry[0].slice(1), entry[1]]);
sequelize.models = Object.fromEntries(capsEntries);

// En sequelize.models están todos los modelos importados como propiedades
// Para relacionarlos hacemos un destructuring
const {
    Post,
    Tag,
    User,
    Comment,
    Module,
    Like,
    Order,
    Plan,
    Product,
    Favorite,
    Report,
    Inbox
} = sequelize.models;

User.hasMany(Like)
Like.belongsTo(User)

Post.hasMany(Like)
Like.belongsTo(Post)

Comment.hasMany(Like)
Like.belongsTo(Comment)

User.hasMany(Favorite)
Favorite.belongsTo(User)

Post.hasMany(Favorite)
Favorite.belongsTo(Post)

Comment.hasMany(Favorite)
Favorite.belongsTo(Comment)

User.hasMany(Report)
Report.belongsTo(User)

Post.hasMany(Report)
Report.belongsTo(Post)

Comment.hasMany(Report)
Report.belongsTo(Comment)

User.hasMany(Inbox)
Inbox.belongsTo(User)

Like.hasMany(Inbox)
Inbox.belongsTo(Like)

Comment.hasMany(Inbox)
Inbox.belongsTo(Comment)

Post.belongsToMany(Tag, { through: "Posts_Tags" });
Tag.belongsToMany(Post, { through: "Posts_Tags" });

Module.hasMany(Post);
Post.belongsTo(Module);

User.hasMany(Post);
Post.belongsTo(User);

Post.hasMany(Comment);
Comment.belongsTo(Post);

User.hasMany(Comment);
Comment.belongsTo(User);

Module.hasMany(Tag);
Tag.belongsTo(Module);

User.hasMany(Order);
Order.belongsTo(User);

Plan.hasMany(Product);
Product. belongsTo(Plan);



module.exports = {
    ...sequelize.models, // para poder importar los modelos así: const { Product, User } = require('./db.js');
    conn: sequelize,     // para importart la conexión { conn } = require('./db.js');
    Op,
};
