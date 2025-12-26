const { buildSchema } = require('graphql');

module.exports = buildSchema(`
        type Post {
            _id: ID!
            title: String!
            content: String!
            imageUrl: String!
            creator: User!
            createdAt: String!
            updatedAt: String!
        }

        type User {
            _id: ID!
            name: String!
            email: String!
            password: String
            status: String!
            posts: [Post!]!
        }

        input UserInputData {
            email: String!
            name: String!
            password: String!
        }

        input PostInputData {
            title: String!
            content: String!
            imageUrl: String!
        }

        type AuthData {
            token: String!
            userId: String!
        }

        type PostsPage {
            posts: [Post!]!
            totalItems: Int!
        }

        type DeleteData {
            deletedPost: ID!
        }

        type RootMutation {
            createUser(userInput: UserInputData): User!
            createPost(postInput: PostInputData): Post!
            updatePost(postId: ID!, postInput: PostInputData): Post!
            deletePost(postId: ID!): DeleteData!
        }

        type RootQuery {
            login (email: String!, password: String!): AuthData!
            getPosts(currentPage: Int!, pageSize: Int!): PostsPage!
            getPost(postId: ID!): Post!
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `);