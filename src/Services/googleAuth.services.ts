// src/Services/googleAuth.services.ts
import axios from "axios";

export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token?: string;
}

export interface GoogleUserInfo {
  sub: string;
  name: string;
  email: string;
  email_verified: boolean;
  picture: string;
}

export const exchangeCodeForToken = async (
  code: string,
  redirectUri: string,
  clientId: string,
  clientSecret: string
): Promise<GoogleTokenResponse> => {
  try {
    const params = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    });

    const { data } = await axios.post<GoogleTokenResponse>(
      "https://oauth2.googleapis.com/token",
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return data;
  } catch (error: any) {
    console.error(
      "Error exchanging code for token:",
      error?.response?.data || error
    );
    throw new Error("TOKEN_EXCHANGE_FAILED");
  }
};

export const getGoogleUserInfo = async (
  accessToken: string
): Promise<GoogleUserInfo> => {
  try {
    const { data } = await axios.get<GoogleUserInfo>(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return data;
  } catch (error: any) {
    console.error(
      "Error getting Google user info:",
      error?.response?.data || error
    );
    throw new Error("USERINFO_FETCH_FAILED");
  }
};
