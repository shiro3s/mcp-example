import cors from "cors";
import type { Express } from "express";
import morgan from "morgan";

export const initMiddleware = (app: Express) => {
	app.use(
		cors({
			origin: "*",
			methods: ["HEAD", "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
		}),
	);
	app.use(morgan("tiny"));
};
