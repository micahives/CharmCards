import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { ApolloServer } from '@apollo/server';
import typeDefs from './schemas/typeDefs';
import resolvers from './schemas/resolvers';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
const server = new ApolloServer({
    typeDefs,
    resolvers
});

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});