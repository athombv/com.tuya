/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'homey-oauth2app' {
  import Homey, {SimpleClass} from 'homey';
  import {Log} from 'homey-log';

  class OAuth2App extends Homey.App {
    onOAuth2Init(): Promise<void>;

    homeyLog: Log;
  }

  class OAuth2Client extends SimpleClass {
    static API_URL: string;
    static TOKEN_URL: string;
    static AUTHORIZATION_URL: string;
    static SCOPES: string[];

    get<T>(data: {
      path: string,
      query?: any,
      headers?: any
    }): Promise<T>;

    delete<T>(data: {
      path: string,
      query?: any,
      headers?: any
    }): Promise<T>;

    post<T>(data: {
      path: string,
      query?: any,
      json?: any,
      body?: any,
      headers?: any
    }): Promise<T>;

    put<T>(data: {
      path: string,
      query?: any,
      json?: any,
      body?: any,
      headers?: any
    }): Promise<T>;

    onShouldRefreshToken(args: {status: number}): Promise<boolean>;

    getToken(): {
      access_token: string,
      refresh_token: string,
      token_type: string,
      expires_in: number,
    };

    async refreshToken(...args): Promise<void>;

    save(): void;
  }

  class OAuth2Device<T extends OAuth2Client> extends Homey.Device {
    oAuth2Client: T;

    onOAuth2Init(): Promise<void>;

    onOAuth2Uninit(): Promise<void>;

    onOAuth2Added(): Promise<void>;

    onOAuth2Deleted(): Promise<void>;

    homey: Homey
  }

  class OAuth2Driver<T extends OAuth2Client> extends Homey.Driver {
    onOAuth2Init(): Promise<void>;

    onPairListDevices(payload: {
      oAuth2Client: T,
    }): Promise<OAuth2DeviceResult[]>;

    homey: Homey
  }

  interface OAuth2DeviceResult {
    name: string;
    data: {
      [key: string]: any
    },
    store?: {
      [key: string]: any
    },
    settings?: {
      [key: string]: any
    },
    icon?: string,
    capabilities?: string[],
    capabilitiesOptions?: {
      [key: string]: {
        [key: string]: any
      }
    },
  }
}

