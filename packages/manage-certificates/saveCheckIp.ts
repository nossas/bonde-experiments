import Dex from "https://deno.land/x/dex/mod.ts";
import Dexecutor from "https://deno.land/x/dexecutor/mod.ts";

const client = "sqlite3";

let dex = new Dex({
    client: client
});

// Creating the query executor
let dexecutor = new Dexecutor({
    client: client,
    connection: {
        filename: "test.db"
    }
});


// Opening the connection
await dexecutor.connect();


let sqlQuery;

// CREATE TABLE Query
sqlQuery = dex.schema.createTable("people", (table) => {
    table.string('name');
}).toString();

await dexecutor.execute(sqlQuery);


// INSERT Query
sqlQuery = dex.queryBuilder()
    .insert([
        {name: "hello"},
        {name: "deno"},
        {name: "world"},
    ])
    .into("people")
    .toString();

await dexecutor.execute(sqlQuery);


// SELECT Query
let result = await dexecutor.execute(
    dex.queryBuilder()
        .select("*")
        .from("people")
        .toString()
);

console.log(result);


// DROP TABLE Query
sqlQuery = dex.schema.dropTable("people").toString();

await dexecutor.execute(sqlQuery);


// Closing the connection
await dexecutor.close();