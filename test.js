import { resoResolve } from "./src/core/resolve.js";
import { validPathsList } from "./src/core/paths.js";

const validPaths = validPathsList();

const url = resoResolve('/bad-luck.html', validPaths);

console.log(url);