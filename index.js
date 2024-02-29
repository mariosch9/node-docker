const express = require("express")
const mongoose = require('mongoose');
const session = require("express-session");
const redis = require("redis");
const connectRedis = require("connect-redis");
const cors = require("cors");
const RedisStore = require("connect-redis").default;

const { MONGO_USER } = require("./config/config.js");
const { MONGO_PASSWORD } = require("./config/config.js");
const { MONGO_PORT } = require("./config/config.js");
const { MONGO_IP } = require("./config/config.js");

const postRouter = require("./routes/postRoutes");
const userRouter = require("./routes/userRoutes");
const { REDIS_URL } = require("./config/config.js");
const { SESSION_SECRET } = require("./config/config.js");
const { REDIS_PORT } = require("./config/config.js");

let redisClient = redis.createClient({
    host: REDIS_URL,
    port: REDIS_PORT,
});

const app = express();

const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;

const connectWithRetry = () => {
    mongoose
    .connect(mongoURL)
    .then(() => console.log("succesfully connected to DB"))
        .catch((e) => {
            console.log(e)
            setTimeout(connectWithRetry, 5000)
        });
}

connectWithRetry();

app.enable("trust proxy");
app.use(cors({}));
app.use(session({
    store: new RedisStore({client: redisClient}),
    secret: SESSION_SECRET,
    cookie: {
        secure: false,
        resave: false,
        saveUninitialized: false,
        httpOnly: true,
        maxAge: 30000,
        },
    })
);

app.use(express.json());

app.get("/api/v1", (req, res) => {
    res.send("<h2>Hi there</h2>");
    console.log("yeah it ran");
});

//localhost:3000/api/v1/post/
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/users", userRouter);
const port = process.env.PORT || 3000;

app.listen(port, () => console.log('listening on port ${port}'));