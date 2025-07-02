import {join} from "node:path";
import {config} from "dotenv";
const envPath = join(__dirname, "..", ".env");

config({
    path: envPath,
});
import express from "express";
import errorOverlayMiddleware from 'react-dev-utils/errorOverlayMiddleware';
import webpack, { Configuration } from "webpack";
import webpackDevMiddleware from "webpack-dev-middleware";
import webpackHotMiddleware from "webpack-hot-middleware";
import cors from "cors";
import passport from "passport";

import webpackConfigGenerator from "../../webpack.config";
import gamesRouter from "@server/routes/games";
import authRouter from "@server/routes/auth";
import sessionMiddleware from "@server/session-middleware";

const app = express();

const webpackConfig = webpackConfigGenerator("development") as Configuration;
const compiler = webpack(webpackConfig);

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
app.use(errorOverlayMiddleware());
app.use(express.json());
app.use(cors());

app.use(webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output?.publicPath,
}));
app.use(webpackHotMiddleware(compiler));

app.use('/api/games', gamesRouter);

app.use("/auth", authRouter);

app.use("*", (req, res, next) => {
    if (req.path.includes("/socket.io/")) {
        return next();
    }
    const filename = join(compiler.outputPath, "index.html");
    if (compiler.outputFileSystem == null) {
        throw Error("Cannot serve index file: no output filesystem on the Webpack compiler.");
    }
    compiler.outputFileSystem.readFile(filename, (err, result) => {
        if (err) {
            return next(err);
        }
        res.set("content-type", "text/html");
        res.send(result);
        res.end();
    });
});

const PORT = 8070;

app.listen(PORT, () => {
    console.log("Listening on port", PORT);
});