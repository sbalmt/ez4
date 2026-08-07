import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';
import type { String } from '@ez4/schema';
import type { ApiProvider } from '../provider';

declare class SendEmailRequest implements Http.Request {
  body: {
    content: String.Size<1, 1000>;
  };
}

export async function sendEmailHandler(
  request: SendEmailRequest,
  { emailService }: Service.Context<ApiProvider>
): Promise<Http.SuccessEmptyResponse> {
  const { content } = request.body;

  await emailService.send({
    from: 'sender@test.easyfor.dev',
    to: ['receiver@test.easyfor.dev'],
    subject: 'Test email',
    body: {
      html: content
    }
  });

  return {
    status: 204
  };
}
