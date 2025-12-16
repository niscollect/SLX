export function resoResolve(badPath, validPaths) 
{
  const bad = badPath.toLowerCase();

  let randomNumber = Math.floor(Math.abs(Math.random() * validPaths.length));

  console.log(randomNumber);

  return validPaths[randomNumber];
}
