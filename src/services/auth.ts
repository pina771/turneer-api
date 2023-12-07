import { db } from "@services/db/db";
import jwt from "jsonwebtoken";
import {
	Credentials,
	InsertCredentials,
	InsertUser,
	User,
	credentials,
	users,
} from "@services/db/schemas/user";
import { and, eq } from "drizzle-orm";
import { Router } from "express";
import passport from "passport";
import googleStrategy from "passport-google-oauth20";

const router = Router();
const jwtSecret = process.env.JWT_SECRET as string;
const googleAuthScopes = [
	"https://www.googleapis.com/auth/userinfo.email",
	"https://www.googleapis.com/auth/userinfo.profile",
];

passport.use(
	new googleStrategy.Strategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
			callbackURL: "http://localhost:8000/auth/google/callback",
			scope: googleAuthScopes,
		},
		async function (_, __, profile, cb) {
			if (!profile.emails?.length || !profile.name) {
				return;
			}

			const userCredentials = await db
				.select({
					id: users.id,
					email: users.email,
					firstName: users.firstName,
					lastName: users.lastName,
				})
				.from(credentials)
				.innerJoin(users, eq(users.email, credentials.email))
				.where(
					and(
						eq(credentials.provider, "google"),
						eq(credentials.email, profile.emails[0].value),
					),
				);

			if (!Array.isArray(userCredentials)) {
				console.log("userCredentials is not an array!", userCredentials);
			}

			if (userCredentials.length === 0) {
				const insertedUser = await addUser({
					email: profile.emails[0].value,
					firstName: profile.name.givenName,
					lastName: profile.name.familyName,
				});
				const insertedCredentials = await addCredentials({
					provider: "google",
					credentialId: profile.id,
					email: insertedUser.email,
				});
				console.log("Inserted user:", insertedUser);
				console.log("Inserted credentials", insertedCredentials);
				cb(null, insertedUser);
				return;
			}

			cb(null, userCredentials[0]);
		},
	),
);

router.get(
	"/google",
	passport.authenticate("google", {
		scope: googleAuthScopes,
		session: false,
	}),
);

router.get(
	"/google/callback",
	passport.authenticate("google", {
		session: false,
		scope: googleAuthScopes,
	}),
	(req, res) => {
		const token = createToken(req.user as User);
		res.cookie("access_token", token);
		res.redirect("http://localhost:5173");
	},
);

const createToken = (user: User) => {
	return jwt.sign({ email: user.email }, jwtSecret, { algorithm: "HS256" });
};

const addUser = async (userInfo: InsertUser): Promise<User> => {
	const result = await db.insert(users).values(userInfo).returning();
	return result[0];
};

const addCredentials = async (
	credentialsInfo: InsertCredentials,
): Promise<Credentials> => {
	const result = await db
		.insert(credentials)
		.values(credentialsInfo)
		.returning();
	return result[0];
};


export default router;
