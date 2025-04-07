import express, { type Request, type Response } from "express";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";

import {initMiddleware} from "./middlewares"

const server = new McpServer({
	name: "test",
	version: "1.0.0",
});

server.tool("add", { a: z.number(), b: z.number() }, async ({ a, b }) => {
	return {
		content: [{ type: "text", text: `${a + b}` }],
	};
});

try {
	const app = express();
	const transports: { [sessionId: string]: SSEServerTransport } = {};

	initMiddleware(app)

	app.get("/sse", async (_: Request, res: Response) => {
		const transport = new SSEServerTransport("/messages", res);
		transports[transport.sessionId] = transport;

		res.on("close", () => {
			delete transports[transport.sessionId];
		});
		await server.connect(transport);
	});

	app.post(
		"/messages",
		async (
			req: Request<undefined, undefined, undefined, { sessionId: string }>,
			res: Response,
		) => {
			const sessionId = req.query.sessionId;
			const transport = transports[sessionId];

			if (transport) {
				await transport.handlePostMessage(req, res);
			} else {
				res.status(400).send("No transport found for sessionI");
			}
		},
	);

	app.listen(3001, () => {
		console.log("Server listening on port: 3001");
	});
} catch (error) {
	console.log(error);
}
