import type { EmailAttachment, Client as EmailClient, EmailHeaders, EmailMessage, EmailMessageResponse } from '@ez4/email';
import type { Attachment, MessageHeader } from '@aws-sdk/client-sesv2';

import { SendEmailCommand, SESv2Client } from '@aws-sdk/client-sesv2';
import { Runtime } from '@ez4/common';

export namespace Client {
  const client = new SESv2Client();

  export const make = (): EmailClient => {
    return new (class {
      async send(message: EmailMessage): Promise<EmailMessageResponse> {
        const scope = Runtime.getScope();

        const response = await client.send(
          new SendEmailCommand({
            FromEmailAddress: message.from,
            ReplyToAddresses: message.replyTo,
            Destination: {
              ToAddresses: message.to,
              BccAddresses: message.bcc,
              CcAddresses: message.cc
            },
            Content: {
              Simple: {
                Subject: {
                  Data: message.subject
                },
                Headers: [
                  ...(scope?.traceId ? [{ Name: 'X-Trace-Id', Value: scope?.traceId }] : []),
                  ...buildHeaders(message.headers ?? {})
                ],
                Attachments: buildAttachments(message.attachments ?? []),
                Body: {
                  ...('html' in message.body && {
                    Html: {
                      Data: message.body.html
                    }
                  }),
                  ...('text' in message.body && {
                    Text: {
                      Data: message.body.text
                    }
                  })
                }
              }
            }
          })
        );

        return {
          messageId: response.MessageId!
        };
      }
    })();
  };

  const buildAttachments = (attachments: EmailAttachment[]): Attachment[] => {
    return attachments.map(({ fileName, content, contentType, description, inlineId }) => ({
      FileName: fileName,
      RawContent: content,
      ContentType: contentType,
      ContentDescription: description,
      ContentId: inlineId
    }));
  };

  const buildHeaders = (headers: EmailHeaders): MessageHeader[] => {
    return Object.entries(headers).map(([name, value]) => ({
      Name: name,
      Value: value
    }));
  };
}
