 # Apollo Server GraphQL with Couchbase

 This project is a Apollo GraphQL server that uses a Couchbase non-relational database as its data storage.

 ## Prerequisites:
- **Node.js**: Make sure you have Node.js installed on your system. You can check if Node.js is installed by running the following command in your terminal:
    ```bash
    node -v
    ```
    If Node.js is not installed, you can download it from [here](https://nodejs.org/en).
- **Couchbase**: You need to have a Couchbase account and cluster set up. If you don't have one, you can sign up [here](https://cloud.couchbase.com/sign-in).

 ## Installation:

 1. Clone this repository to your local machine:

    ```bash
    git clone https://github.com/IDWM/products-apollo-graphql.git
    ```

 2. Navigate to the project directory:

    ```bash
    cd products-apollo-graphql
    ```

 3. Install project dependencies:

    ```bash
    npm install
    ```

 4. Create a `.env` file in the root of the project based on the `.env.example` file. This file will contain the configuration of your Couchbase cluster:

    ```bash
    cp .env.example .env
    ```

 5. Open the `.env` file and provide the required information:

    ```bash
    COUCHBASE_CLUSTER=<CLUSTER_URL>
    COUCHBASE_USERNAME=<YOUR_USERNAME>
    COUCHBASE_PASSWORD=<YOUR_PASSWORD>
    ```

 6. Once you have configured your Couchbase cluster and provided the credentials in the `.env` file, you can start the application:

    ```bash
    npm start
    ```