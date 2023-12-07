import authRouter from "@services/auth";
import cors from "cors";
import express from "express";
import { expressjwt as jwt, Request as JWTRequest } from "express-jwt";

const port = process.env.PORT || 8080;
const jwtSecret = process.env.JWT_SECRET as string;

const app = express();

app.use(
	cors({
		origin: "http://localhost:5173",
		credentials: true,
	}),
);

app.use(express.json());

app.use("/auth", authRouter);

app.get("/statuscheck", (req, res) => {
	return res.send({ message: "live" });
});

app.get(
	"/protected",
	jwt({ secret: jwtSecret, algorithms: ["HS256"] }),
	(req: JWTRequest, res) => {
		if (!req.auth) {
			return res.sendStatus(401);
		} else {
			const userInfo = req.auth as {email : string};
			console.log(req.auth);
			return res.status(200).send({ message: "works!" });
		}
	},
);

app.listen(port, () => {
	console.log("server listening on port", port);
});

declare module "jsonwebtoken" {
	interface JWTPayload {
		email: string
	}
}

