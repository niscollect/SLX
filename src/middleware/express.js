import { resoResolve } from "../core/resolve.js";

export function reso(validPaths)
{
    return function (req, res, next)
    {
        const resolved = resoResolve(req.path, validPaths);

        if(resolved)
            return res.redirect(302, resolved)

        next();
    }
}