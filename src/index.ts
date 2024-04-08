import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import couchbase, { Bucket, Collection, GetResult } from 'couchbase';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

const typeDefs = `#graphql
    type Product {
        name: String
        price: Float
        quantity: Int
        tags: [String]
    }

    input ProductInput {
        name: String
        price: Float
        quantity: Int
        tags: [String]
    }

    type Query {
        getProduct(id: String): Product
        getProducts: [Product]
    }

    type Mutation {
        createProduct(product: ProductInput): Product
        deleteProduct(id: String): Boolean
        updateProduct(id: String, product: ProductInput): Product
        setQuantity(id: String, quantity: Int): Boolean
    }
`;

const resolvers = {
    Query: {
    },
    Mutation: {
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

dotenv.config();

const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async ({ req, res }) => ({
        couchbaseCluster: await couchbase.connect(
            process.env.COUCHBASE_CLUSTER,
            {
                username: process.env.COUCHBASE_USERNAME,
                password: process.env.COUCHBASE_PASSWORD,
                configProfile: 'wanDevelopment',
            }
        )
    })
});

console.log(`Server ready at ${url}`);