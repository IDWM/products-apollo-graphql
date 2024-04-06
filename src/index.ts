import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import couchbase, { Bucket, BucketNotFlushableError, Cluster, Collection, GetResult, MutationResult, Scope } from "couchbase";
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
    }

    type Mutation {
        createProduct(product: ProductInput): Product
    }
`;

const resolvers = {
    Query: {
        async getProduct(_, args, contextValue) {
            const { id } = args;

            const bucket: Bucket = contextValue.couchbaseCluster.bucket('store-bucket');
            const collection: Collection = bucket.scope('products-scope').collection('products');

            const getResult: GetResult = await collection.get(id).catch((error) => {
                console.error(error);
                throw error;
            });

            return getResult.content;
        }
    },
    Mutation: {
        async createProduct(_, args, contextValue) {
            const { product } = args;

            const bucket: Bucket = contextValue.couchbaseCluster.bucket('store-bucket');
            const collection: Collection = bucket.scope('products-scope').collection('products');

            const key: string = uuidv4();

            const createdMutation: MutationResult = await collection.insert(key, product).catch((error) => {
                console.error(error);
                throw error;
            });

            return product;
        }
    }
};

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
                configProfile: "wanDevelopment",
            }
        )
    })
});

console.log(`Server ready at ${url}`);