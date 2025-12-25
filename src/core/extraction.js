import { readFile } from "fs/promises";
import { parse } from "acorn";

// const filePath = "./index.js";

export async function parseFile(filePath) {
  try 
  {
    //* 1. Read the file content as a string
    const code = await readFile(filePath, "utf8");

    //* 2. Pass the string to Acorn
    const ast = parse(code, {
      ecmaVersion: "latest",
      sourceType: "module", // Required if the file uses import/export
    });

    // console.log(ast);

    console.log(typeof(ast));

    const elements = ast.body;

    for(const el of elements)
    {
        if(el.type == "ExpressionStatement")
        {
            // console.log(el.type);
            // const calleeName = el.expression.callee.property.name;  // 'get' or 'post' or 'use'
            // console.log("calleeName = ", calleeName);
            // const argsValue = el.expression.arguments[0].value;
            // console.log("argsValue = ", argsValue);
            // console.log("\n");
            
            console.log(el?.expression?.type);
            console.log(el?.expression?.callee?.type);
            console.log(el?.expression?.callee.property?.name);
            console.log(el?.expression?.arguments[0]?.type, "\n");


            
        }

    }

  }
  catch (err) 
  {
    console.error("Error reading or parsing file:", err);
  }
}

parseFile();
