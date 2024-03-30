import express, { Express } from "express";
import 'dotenv/config';
// may need path module for specifying prod vs. dev builds later on
// import path from 'path';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { authMiddleware } from "./utils/auth";

import { typeDefs, resolvers }from './schemas';
// can alias import since it is exported as default in config/connection
import db from './config/connection';

// Ignore punycode deprecation warnings as it originates from TS type definition files,
// rather than actual usage of punycode module. Updated "node --no-deprecation server.ts" in start script
process.on('warning', (warning) => {
  if (warning.name === 'DeprecationWarning' && warning.message.includes('punycode')) {
    return;
  }

  console.warn(warning);
});

const app: Express = express();
const PORT = process.env.PORT || 3000;
const server = new ApolloServer({
    typeDefs,
    resolvers
});

const startApolloServer = async () => {
  await server.start();

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.use('/graphql', expressMiddleware(server, {
    context: authMiddleware
  }));

  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`[server]: Server is running at http://localhost:${PORT}`);
      console.log(`Use Graphql at http:localhost:${PORT}/graphql`);
    });
  })
};

startApolloServer();