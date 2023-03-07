import {
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import ddbDocClient from "../utils/dynamoDbConfig";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { createUserSchema, getUserSchema } from "../schema/user.schema";
import { log as logger } from "../utils/logger";

dotenv.config();

// Define the user interface
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  salt: string;
  createdAt: string;
}

// Define the user interface
export interface UserInput {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

// Define the DynamoDB table name
const tableName = process.env.USERS_TABLE;

// Define the get method to retrieve a user by email
export async function getUserByEmail(email: string): Promise<User> {
  const params = {
    TableName: tableName,
    IndexName: "email-id-index",
    KeyConditionExpression: "email = :email",
    ExpressionAttributeValues: {
      ":email": { S: email },
    },
  };

  const { Items } = await ddbDocClient.send(new QueryCommand(params));

  if (Items && Items.length > 0) {
    const user: Omit<User, "passwordConfirmation"> = {
      id: Items[0].id.S!,
      name: Items[0].name.S!,
      email: Items[0].email.S!,
      password: Items[0].password.S!,
      salt: Items[0].salt.S!,
      createdAt: Items[0].createdAt.S!,
    };

    return getUserSchema.parse(user) as User;
  } else {
    throw new Error("User not found");
  }
}

// Define the create method to add a new user
export async function createUser(user: UserInput): Promise<User> {
  //   createUserSchema.parse(user); // Validate the input using the schema

  try {
    const existingUser = await getUserByEmail(user.email);
    if (existingUser) {
      throw new Error("User already exists with this email");
    }
  } catch (error: any) {
    if (error.message !== "User not found") {
      throw error;
    }
  }

  if (user.password !== user.passwordConfirmation) {
    throw new Error("Password and password confirmation do not match");
  }

  const id = uuidv4();
  const createdAt = new Date().toISOString();
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(user.password, salt);

  const params = {
    TableName: tableName,
    Item: {
      id: { S: id },
      name: { S: user.name },
      email: { S: user.email },
      password: { S: hashedPassword },
      salt: { S: salt },
      createdAt: { S: createdAt },
    },
  };

  await ddbDocClient.send(new PutItemCommand(params));

  return { ...user, password: hashedPassword, salt, id, createdAt };
}

// Define the update method to update an existing user
export async function updateUser(user: User): Promise<User> {
  const params = {
    TableName: tableName,
    Key: { id: { S: user.id } },
    UpdateExpression:
      "SET #name = :name, #email = :email, #password = :password, #salt = :salt, #createdAt = :createdAt",
    ExpressionAttributeNames: {
      "#name": "name",
      "#email": "email",
      "#password": "password",
      "#salt": "salt",
      "#createdAt": "createdAt",
    },
    ExpressionAttributeValues: {
      ":name": { S: user.name },
      ":email": { S: user.email },
      ":password": { S: user.password },
      ":salt": { S: user.salt },
      ":createdAt": { S: user.createdAt },
    },
  };

  await ddbDocClient.send(new UpdateItemCommand(params));
  return user;
}

// Define the delete method to remove a user by ID
export async function deleteUser(id: string): Promise<void> {
  const params = {
    TableName: tableName,
    Key: { id: { S: id } },
  };

  await ddbDocClient.send(new DeleteItemCommand(params));
}

// Define the method to check a user's password
export async function checkPassword(
  email: string,
  password: string
): Promise<boolean> {
  const params = {
    TableName: tableName,
    Key: { email: { S: email } },
  };

  const { Item } = await ddbDocClient.send(new GetItemCommand(params));

  if (!Item) {
    return false;
  }

  const hashedPassword = Item.password.S!;
  const salt = Item.salt.S!;
  const isValidPassword = await bcrypt.compare(password, hashedPassword + salt);

  return isValidPassword;
}
