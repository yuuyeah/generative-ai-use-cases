import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { UpdateMinutesCustomPromptRequest } from 'generative-ai-use-cases';
import {
  listMinutesCustomPrompts,
  createMinutesCustomPrompt,
  updateMinutesCustomPrompt,
  deleteMinutesCustomPrompt,
} from './repository';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId: string =
      event.requestContext.authorizer!.claims['cognito:username'];
    const method = event.httpMethod;

    if (method === 'GET') {
      const items = await listMinutesCustomPrompts(userId);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(items),
      };
    }

    if (method === 'POST') {
      const req = JSON.parse(event.body!);
      const prompt = await createMinutesCustomPrompt(
        userId,
        req.minutesCustomPromptTitle,
        req.minutesCustomPromptBody
      );
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ minutesCustomPrompt: prompt }),
      };
    }

    if (method === 'PUT') {
      const minutesCustomPromptId =
        event.pathParameters!.minutesCustomPromptId!;
      const req: UpdateMinutesCustomPromptRequest = JSON.parse(event.body!);
      const prompt = await updateMinutesCustomPrompt(
        userId,
        minutesCustomPromptId,
        req.title,
        req.body
      );
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ minutesCustomPrompt: prompt }),
      };
    }

    if (method === 'DELETE') {
      const minutesCustomPromptId =
        event.pathParameters!.minutesCustomPromptId!;
      await deleteMinutesCustomPrompt(userId, minutesCustomPromptId);
      return {
        statusCode: 204,
        headers,
        body: '',
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
