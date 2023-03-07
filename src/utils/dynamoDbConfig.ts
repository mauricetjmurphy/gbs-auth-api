import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import dotenv from "dotenv";

dotenv.config();

interface Credentials {
  accessKeyId: string;
  secretAccessKey: string;
}

const client = new DynamoDBClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID as string,
    secretAccessKey: process.env.SECRET_ACCESS_KEY as string,
  } as Credentials,
});
const ddbDocClient: DynamoDBDocumentClient =
  DynamoDBDocumentClient.from(client);

export default ddbDocClient;
