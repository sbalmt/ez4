/**
 * Email client.
 */
export interface Client {
  /**
   * Send a new email.
   *
   * @param message Email message object.
   * @returns Returns the email message response.
   */
  send(message: EmailMessage): Promise<EmailMessageResponse>;
}

/**
 * HTML body content for the email.
 */
export type EmailHtmlBody = {
  html: string;
};

/**
 * Text body content for the email.
 */
export type EmailTextBody = {
  text: string;
};

/**
 * Email headers.
 */
export type EmailHeaders = {
  [name: string]: string;
};

/**
 * Email attachment data.
 */
export type EmailAttachment = {
  /**
   * Attachment file name.
   */
  fileName: string;

  /**
   * Attachment content.
   */
  content: Uint8Array;

  /**
   * Optional attachment description.
   */
  description?: string;

  /**
   * Optional content type overwrite.
   */
  contentType?: string;

  /**
   * When specified the attachment is treated as inline.
   */
  inlineId?: string;
};

/**
 * Email message object.
 */
export type EmailMessage = {
  /**
   * From email address.
   */
  from: string;

  /**
   * To email addresses.
   */
  to: string[];

  /**
   * Message subject.
   */
  subject: string;

  /**
   * Message body.
   */
  body: EmailHtmlBody | EmailTextBody | (EmailHtmlBody & EmailTextBody);

  /**
   * List of attachments in the message.
   */
  attachments?: EmailAttachment[];

  /**
   * Message headers.
   */
  headers?: EmailHeaders;

  /**
   * Specify the "reply to" addresses.
   */
  replyTo?: string[];

  /**
   * Specify the blind carbon copy addresses.
   */
  bcc?: string[];

  /**
   * Specify the carbon copy addresses.
   */
  cc?: string[];
};

/**
 * Email message response.
 */
export type EmailMessageResponse = {
  /**
   * Message Id.
   */
  messageId: string;
};
