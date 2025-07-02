import { User } from "@root/types/index";
import express from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

const router = express.Router();

router.post("/login", passport.authenticate(
    "local",
    {
        successRedirect: "/",
        failureRedirect: "/",
    }
));

router.post("/logout", (req, res, next) => {
    req.session.destroy(() => {
        res.status(204).end();
    });
});

passport.use(new LocalStrategy(async (username, password, done) => {
    // Pretend any credentials are valid for now
    // TODO: do actual authentication here
    const user: User = {
        id: 1234,
        name: {
            display: 'Test User',
        },
    };
    return done(null, user);
}));

export default router;
