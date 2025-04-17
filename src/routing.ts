import { Request, Response, Router } from "express";

interface ExtruderPostData {
	readonly timestamp: number;
	readonly fileContent: string;
	readonly fileLength: number;
}

/**
 * De verbinden van en naar de server moet
 * eerst geinitializeerd worden. De server kan dan
 * bepalen welke acties er uitgevoerd moeten worden.
 * @param router
 */
export function initializeRouter(router: Router) {

	router.get("/", function (req: Request, res: Response) {

		return res.render("dashboard");
	});

	router.get("/dashboard", function (req: Request, res: Response) {

		res.render("dashboard");
	});

	router.get("/live-data", function (req: Request, res: Response) {

		res.render("live-data");
	});

	router.post("/extruder-connection-establishment", function (req: Request, res: Response) {

		const data = req.body;

		console.log(req.ip);

		res.status(200).send("ok");
	});

	router.post("/extruder-data", function (req: Request, res: Response) {

		const data: ExtruderPostData = req.body;

		console.log(data.fileContent);

	});

}