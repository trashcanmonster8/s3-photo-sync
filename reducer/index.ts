import { Callback, Context, Handler, S3Event } from 'aws-lambda';

export const handler: Handler<S3Event, object> = async (event: S3Event, context: Context, callback: Callback<void>): Promise<object> => {
    return {event, context, callback};
}
