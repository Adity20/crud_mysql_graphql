const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Initialize Sequelize
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT,
});

// Define a User model
const User = sequelize.define('User', {
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Build GraphQL schema
const schema = buildSchema(`
  type Query {
    getUser(id: Int!): User
    getUsers: [User]
  }
  type Mutation {
    createUser(firstName: String!, lastName: String!, email: String!): User
    updateUser(id: Int!, firstName: String, lastName: String, email: String): User
    deleteUser(id: Int!): String
  }
  type User {
    id: Int
    firstName: String
    lastName: String
    email: String
  }
`);

// Define root resolvers
const root = {
  getUser: async ({ id }) => {
    return await User.findByPk(id);
  },
  getUsers: async () => {
    return await User.findAll();
  },
  createUser: async ({ firstName, lastName, email }) => {
    return await User.create({ firstName, lastName, email });
  },
  updateUser: async ({ id, firstName, lastName, email }) => {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error('User not found');
    }
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    await user.save();
    return user;
  },
  deleteUser: async ({ id }) => {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error('User not found');
    }
    await user.destroy();
    return `User with id ${id} was deleted.`;
  },
};

// Initialize Express app
const app = express();

// GraphQL endpoint
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

// Start the server
app.listen(4000, () => {
  console.log('Server is running on http://localhost:4000/graphql');
});
