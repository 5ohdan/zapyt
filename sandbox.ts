import { FetchClient } from "./index";

const client = new FetchClient("https://jsonplaceholder.typicode.com/");

(async () => {
  console.log(await client.get("todos/1"));
  console.log(await client.post("todos", { title: "delectus aut autem" }));
  console.log(await client.put("todos/1", { title: "delectus aut autem" }));
  console.log(await client.delete("todos/1"));
})();
