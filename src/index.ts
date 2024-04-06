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
        async getProduct(_, args, contextValue) {
            const { id } = args;

            const bucket: Bucket = contextValue.couchbaseCluster.bucket('store-bucket');
            const collection: Collection = bucket.scope('products-scope').collection('products');

            const getResult: GetResult = await collection.get(id).catch((error) => {
                console.log(error);
                throw error;
            });

            return getResult.content;
        },
        async getProducts(_, __, contextValue) {
            const result = await contextValue.couchbaseCluster.searchQuery(
                'index-products',
                couchbase.SearchQuery.matchAll()
            )

            const bucket: Bucket = contextValue.couchbaseCluster.bucket('store-bucket');
            const collection: Collection = bucket.scope('products-scope').collection('products');

            const products = [];

            for (var i = 0; i < result.rows.length; i++) {
                const id = result.rows[i].id;
                const getResult: GetResult = await collection.get(id).catch((error) => {
                    console.log(error);
                    throw error;
                });

                products.push(getResult.content);
            }

            return products;
        }
    },
    Mutation: {
        async createProduct(_, args, contextValue) {
            const { product } = args;

            const bucket: Bucket = contextValue.couchbaseCluster.bucket('store-bucket');
            const collection: Collection = bucket.scope('products-scope').collection('products');

            const key = uuidv4();

            await collection.insert(key, product).catch((error) => {
                console.log(error);
                throw error;
            });

            return product;
        },
        async deleteProduct(_, args, contextValue) {
            const { id } = args;

            const bucket: Bucket = contextValue.couchbaseCluster.bucket('store-bucket');
            const collection: Collection = bucket.scope('products-scope').collection('products');

            await collection.remove(id).catch((error) => {
                console.log(error);
                throw error;
            });

            return true;
        },
        async updateProduct(_, args, contextValue) {
            const { id, product } = args;

            const bucket: Bucket = contextValue.couchbaseCluster.bucket('store-bucket');
            const collection: Collection = bucket.scope('products-scope').collection('products');

            await collection.replace(id, product).catch((error) => {
                console.log(error);
                throw error;
            });

            return product;
        },
        async setQuantity(_, args, contextValue) {
            const { id, quantity } = args;

            const bucket: Bucket = contextValue.couchbaseCluster.bucket('store-bucket');
            const collection: Collection = bucket.scope('products-scope').collection('products');

            await collection.mutateIn(id,
                [
                    couchbase.MutateInSpec.replace('quantity', quantity)
                ]
            ).catch((error) => {
                console.log(error);
                throw error;
            });

            return true;
        }
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