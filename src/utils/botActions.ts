const bot_token = "8121781737:AAGy9kv8kvFjwF1TpODH2lthNcVom6M_EZI";
const channelID = "-1002400975853"; // Add -100 prefix for supergroup/channel IDs
const channelUsername = "@BTradingVIP_Bot";
const bot_username = "BTradingVIP_Bot";
const bot_api = `https://api.telegram.org/bot${bot_token}`;
// const userID = 6463737305;

// telegramInvite.ts

export interface CreateInviteLinkParams {
  chat_id: string;
  expire_date?: number;
  member_limit?: number;
  name?: string;
}

export interface TelegramResponse<T> {
  ok: boolean;
  result: T;
  description?: string; // Added for error messages
}

/**
 * Creates a Telegram channel invite link using the Bot API's createChatInviteLink method.
 *
 * @param botToken - Your Telegram bot token.
 * @param channelId - The channel identifier (e.g., '@yourchannelusername' or a numeric ID as a string).
 * @param options - Optional parameters for the invite link.
 * @returns A promise that resolves to the Telegram API response.
 */
export async function createChannelInviteLink(
  botToken: string,
  channelId: string,
  options?: Partial<CreateInviteLinkParams>
): Promise<TelegramResponse<any>> {
  try {
    const expireDate =
      options?.expire_date || Math.floor(Date.now() / 1000) + 3600; // 1 hour expiry

    const params: CreateInviteLinkParams = {
      chat_id: channelId,
      expire_date: expireDate,
      member_limit: options?.member_limit || 1,
      name: options?.name,
    };

    const url = `https://api.telegram.org/bot${botToken}/createChatInviteLink`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    const data: TelegramResponse<any> = await response.json();

    if (!data.ok) {
      throw new Error(
        `Telegram API error: ${data.description || "Unknown error"}`
      );
    }

    // console.log('Telegram API response:', data.result.invite_link); // Debug log
    return data;
  } catch (error) {
    console.error("Error details:", error);
    throw error;
  }
}

/**
 * Sends a message to a Telegram user using their Telegram ID.
 *
 * @param botToken - Your Telegram bot token.
 * @param userId - The Telegram user ID (or chat ID) to send the message to.
 * @param text - The message text to send.
 * @returns A promise that resolves to the Telegram API response.
 */
export async function sendMessage(
  botToken: string,
  userId: string | number,
  inviteLink: string
): Promise<TelegramResponse<any>> {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const params = {
    chat_id: userId,
    text: `Hello! Here is your invite link: ${inviteLink} \n\nNote: this link will expire in 1 hour and can be used only once.`,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const data: TelegramResponse<any> = await response.json();

  if (!data.ok) {
    throw new Error(
      `Telegram API error: ${data.description || "Unknown error"}`
    );
  }

  return data;
}

export { bot_token, channelID, bot_username, bot_api };
