import express from "express";
import cors from "cors";
import bodyparser from "body-parser"; 
import dotenv from "dotenv";
import path from "path";
import https from "https";
import fs from "fs";

import { DATA_DIR, DIST_DIR, DOTENV_FILE, PUBLIC_DIR, ROOT_DIR, SERVER_PORT, VIEWS_DIR } from "./constants";
import { initializeRouter } from "./routing";

import { Express, Router } from "express";

dotenv.config({ path: DOTENV_FILE });

const certificiateOptions = {
	key: fs.readFileSync(path.join(DATA_DIR, "localhost-key.pem"), "utf-8"),
	cert: fs.readFileSync(path.join(DATA_DIR, "localhost.pem"), "utf-8")
}

const app: Express = express();
const router: Router = Router();
const server = https.createServer(certificiateOptions, app);

app.set("view engine", "ejs");
app.set("views", VIEWS_DIR);

app.use("/static/dist", express.static(DIST_DIR));
app.use("/static/data", express.static(DATA_DIR));
app.use("/static/fonts", express.static(path.join(PUBLIC_DIR, "fonts")));
app.use("/static/icons", express.static(path.join(PUBLIC_DIR, "icons")));
app.use("/static/images", express.static(path.join(PUBLIC_DIR, "images")));

// Router word eerst ingesteld, pas daarna kan 
// de server verder geconfigureerd worden.
initializeRouter(router);

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(cors());
app.use("/", router);

server.listen(SERVER_PORT, function () {

	console.log(`Lokale web-server draait nu op poort ${SERVER_PORT}`);
	console.log(`Je kunt de web-applicatie bezoeken op https://localhost:${SERVER_PORT}`);
});