import fs from "fs"; 
import path from "path";

/** Verwijst naar 'PROJ.1 - Grafiek weergave/program' */
export const ROOT_DIR: string = path.join(__dirname, "../");

/** Verwijst naar 'PROJ.1 - Grafiek weergave/program/public' */
export const PUBLIC_DIR: string = path.join(ROOT_DIR, "public");

/** Verwijst naar 'PROJ.1 - Grafiek weergave/program/public/views' */
export const VIEWS_DIR: string = path.join(PUBLIC_DIR, "dist");

/** Verwijst naar het .env bestand dat zich bevindt in het ROOT_DIR map. */
export const DOTENV_FILE: string = path.join(ROOT_DIR, ".env");

/** Poort van de lokale webserver. */
export const SERVER_PORT: number = 8000;

/** Verwijst naar 'PROJ.1 - Grafiek weergave/program/public/build' */
export const DIST_DIR: string = path.join(PUBLIC_DIR, "dist");

/** Verwijst naar 'PROJ.1 - Grafiek weergave/program/public/data' */
export const DATA_DIR: string = path.join(ROOT_DIR, "data");