import Fastify from "fastify";
import { ApolloServer } from "@apollo/server";
import { fastifyApolloDrainPlugin, fastifyApolloHandler } from "@as-integrations/fastify";
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";
import type { ApolloContext } from "./context";
import { buildContext } from "./context";
import { startOutboxWorker } from "./outbox/worker";

const PORT = Number(process.env.PORT ?? 4000);

async function main() {
  const fastify = Fastify({ logger: true });

  const apollo = new ApolloServer<ApolloContext>({
    typeDefs,
    resolvers,
    plugins: [fastifyApolloDrainPlugin(fastify)],
  });

  await apollo.start();

  fastify.get("/health", async () => ({ status: "ok", ts: new Date().toISOString() }));

  fastify.route({
    url: "/graphql",
    method: ["GET", "POST", "OPTIONS"],
    handler: fastifyApolloHandler(apollo, { context: buildContext }),
  });

  await fastify.listen({ port: PORT, host: "0.0.0.0" });
  console.log(`API corriendo en http://localhost:${PORT}/graphql`);

  startOutboxWorker();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
