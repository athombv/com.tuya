import crypto from 'crypto';
import { TuyaDeviceResponse, TuyaStatusResponse } from '../types/TuyaApiTypes';
import { Locale, SettingsEvent, Translation, TuyaStatus } from '../types/TuyaTypes';
import TuyaOAuth2Device from './TuyaOAuth2Device';

/**
 * This method converts:
 * ```js
 * [{ code: 'foo', value: '{"x": "y"}' }]
 * ```
 *
 * to:
 *
 * ```js
 * { foo: { x: y } }
 * ```
 * @param {Array} statuses
 * @returns {Object}
 */
export function convertStatusArrayToStatusObject(statuses?: TuyaStatusResponse): TuyaStatus {
  if (!Array.isArray(statuses)) {
    return {};
  }

  return statuses.reduce((obj, item) => {
    obj[item.code] = item.value;

    // Parse JSON
    if (typeof obj[item.code] === 'string' && hasJsonStructure(obj[item.code] as string)) {
      try {
        obj[item.code] = JSON.parse(obj[item.code] as string);
      } catch (err) {
        /* empty */
      }
    }

    return obj;
  }, {} as TuyaStatus);
}

/*
 * Sign headers for the Tuya API
 */
export function getSignedHeaders({
  method,
  body = '',
  path,
  clientId,
  clientSecret,
  accessToken = null,
  nonce = crypto.randomBytes(16).toString('hex'),
  bundleId = 'app.homey',
  t = Date.now(),
}: {
  method: string;
  body?: string;
  path: string;
  clientId: string;
  clientSecret: string;
  accessToken?: string | null;
  nonce?: string;
  bundleId?: string;
  t?: number;
}): Record<string, string> {
  const headers: Record<string, string> = {};

  // Calculate signature
  const contentHash = crypto.createHash('sha256').update(body).digest('hex');

  const stringToSign =
    typeof accessToken === 'string'
      ? `${clientId}${accessToken}${t}${nonce}${bundleId}${method}\n${contentHash}\n\n${path}`
      : `${clientId}${t}${nonce}${bundleId}${method}\n${contentHash}\n\n${path}`;

  headers['t'] = String(t);
  headers['nonce'] = String(nonce);
  headers['client_id'] = String(clientId);
  headers['sign_method'] = 'HMAC-SHA256';
  headers['sign'] = crypto.createHmac('sha256', clientSecret).update(stringToSign).digest('hex').toUpperCase();

  if (typeof accessToken === 'string') {
    headers['access_token'] = accessToken;
  }

  return headers;
}

/*
 * Redact sensitive fields when logging Device information
 */
export function redactFields(device: TuyaDeviceResponse, additionalFields: string[] = []): TuyaDeviceResponse {
  const defaultFields = ['ip', 'lat', 'lon', 'owner_id', 'uid', 'uuid', 'local_key'];
  const combinedFields = [...new Set([...defaultFields, ...additionalFields])];

  const newObj = JSON.parse(JSON.stringify(device));
  combinedFields.forEach(field => {
    // eslint-disable-next-line no-prototype-builtins
    if (newObj.hasOwnProperty(field)) {
      newObj[field] = '<redacted>';
    }
  });

  return newObj;
}

export function hasJsonStructure(str: unknown): boolean {
  if (typeof str !== 'string') return false;
  try {
    const result = JSON.parse(str);
    const type = Object.prototype.toString.call(result);
    return type === '[object Object]' || type === '[object Array]';
  } catch (err) {
    return false;
  }
}

export async function handleScaleSetting<T extends string, S extends Record<T, string>>(
  device: TuyaOAuth2Device,
  event: SettingsEvent<S>,
  settingKey: T,
  homeyCapability: string | undefined,
): Promise<void> {
  if (!event.changedKeys.includes(settingKey)) {
    return;
  }

  if (!homeyCapability || !device.hasCapability(homeyCapability)) {
    return;
  }

  const oldScaling = 10.0 ** Number.parseInt(event.oldSettings[settingKey] ?? '0', 10);
  const newScaling = 10.0 ** Number.parseInt(event.newSettings[settingKey] ?? '0', 10);
  const oldValue = device.getCapabilityValue(homeyCapability);
  const newValue = (oldValue * oldScaling) / newScaling;

  await device.setCapabilityValue(homeyCapability, newValue);
}

/**
 * Send basic setting to the given device, throwing an error for the user if it or the new value is unsupported
 * @param device - The device for which the settings are updated
 * @param code - The Tuya code of the setting
 * @param value - The new value of the setting
 * @param settingLabels - A mapping from setting keys to their user-friendly label
 */
export async function sendSetting(
  device: TuyaOAuth2Device,
  code: string,
  value: unknown,
  settingLabels: Record<string, Translation>,
): Promise<void> {
  await device
    .sendCommand({
      code: code,
      value: value,
    })
    .catch(err => {
      if (err.tuyaCode === 2008) {
        throw new Error(
          device.homey.__('setting_unsupported', {
            label: settingLabels[code][device.homey.i18n.getLanguage() as Locale],
          }),
        );
      } else if (err.tuyaCode === 501) {
        throw new Error(
          device.homey.__('setting_value_unsupported', {
            label: settingLabels[code][device.homey.i18n.getLanguage() as Locale],
          }),
        );
      } else {
        throw err;
      }
    });
}

/**
 * Send basic settings to the given device
 * @param device - The device for which the settings are updated
 * @param event - The settings event
 */
export async function sendSettings<T extends { [key: string]: unknown }>(
  device: TuyaOAuth2Device,
  { newSettings, changedKeys }: SettingsEvent<T>,
): Promise<[(keyof T)[], (keyof T)[]]> {
  const unsupportedSettings: (keyof T)[] = [];
  const unsupportedValues: (keyof T)[] = [];

  // Accumulate rejected settings so the user can be notified gracefully
  for (const changedKey of changedKeys as string[]) {
    const newValue = newSettings[changedKey];
    await device
      .sendCommand({
        code: changedKey,
        value: newValue,
      })
      .catch(err => {
        if (err.tuyaCode === 2008) {
          unsupportedSettings.push(changedKey);
        } else if (err.tuyaCode === 501) {
          unsupportedValues.push(changedKey);
        } else {
          throw err;
        }
      });
  }

  return [unsupportedSettings, unsupportedValues];
}

/**
 * Combine unsupported settings into a message for the user
 * @param device - The device for which the settings are updated
 * @param unsupportedSettings - Settings that are wholly unsupported
 * @param unsupportedValues - Settings for which the new value is unsupported
 * @param settingLabels - A mapping from setting keys to their user-friendly label
 */
export function reportUnsupportedSettings<T extends Record<string, Translation>>(
  device: TuyaOAuth2Device,
  unsupportedSettings: (keyof T)[],
  unsupportedValues: (keyof T)[],
  settingLabels: T,
): string | void {
  // Report back which capabilities and values are unsupported,
  // since we cannot programmatically remove settings.
  const messages = [];

  if (unsupportedSettings.length > 0) {
    const mappedSettingNames = unsupportedSettings.map(
      settingKey => settingLabels[settingKey][device.homey.i18n.getLanguage() as Locale],
    );
    messages.push(device.homey.__('settings_unsupported') + ' ' + mappedSettingNames.join(', '));
  }
  if (unsupportedValues.length > 0) {
    const mappedSettingNames = unsupportedValues.map(
      settingKey => settingLabels[settingKey][device.homey.i18n.getLanguage() as Locale],
    );
    messages.push(device.homey.__('setting_values_unsupported') + ' ' + mappedSettingNames.join(', '));
  }
  if (messages.length > 0) {
    return messages.join('\n');
  }
}

/**
 * Handles basic settings
 * @param device - The device for which the settings are updated
 * @param event - The settings event
 * @param settingLabels - A mapping from setting keys to their user-friendly label
 */
export async function onSettings<T extends { [key: string]: unknown }>(
  device: TuyaOAuth2Device,
  event: SettingsEvent<T>,
  settingLabels: Record<keyof T, Translation>,
): Promise<string | void> {
  const [unsupportedSettings, unsupportedValues] = await sendSettings(device, event);
  return reportUnsupportedSettings(
    device,
    unsupportedSettings as string[],
    unsupportedValues as string[],
    settingLabels,
  );
}

/**
 * Filters Tuya settings that map to Tuya capabilities from a Homey settings event
 * @param homeySettingsEvent - The original settings event
 * @param tuyaSettingsKeys - A list of settings that map to Tuya capabilities
 * @returns A new settings event with only Tuya capabilities in the changedKeys
 */
export function filterTuyaSettings<H extends T, T extends { [key: string]: unknown }>(
  homeySettingsEvent: SettingsEvent<H>,
  tuyaSettingsKeys: (keyof T)[] | readonly (keyof T)[],
): SettingsEvent<T> {
  // only include settings that can be mapped one-to-one with a Tuya capability
  function filterTuyaChangedKeys(changedKeys: (keyof H)[]): (keyof T)[] {
    return changedKeys.filter(key => constIncludes(tuyaSettingsKeys, key)) as (keyof T)[];
  }

  // original settings event is immutable, so a copy is needed
  const tuyaSettingsEvent: SettingsEvent<T> = {
    oldSettings: {
      ...homeySettingsEvent.oldSettings,
    },
    newSettings: {
      ...homeySettingsEvent.newSettings,
    },
    changedKeys: filterTuyaChangedKeys(homeySettingsEvent.changedKeys),
  };

  return tuyaSettingsEvent;
}

// The standard TypeScript definition of Array.includes does not work for const arrays.
// This typing gives a boolean for an unknown S, and true if S is known to be in T from its type.
export function constIncludes<T, S>(array: ReadonlyArray<T>, search: S): S extends T ? true : boolean {
  return (array as unknown[]).includes(search) as S extends T ? true : boolean;
}

export function getFromMap<K extends string | number | symbol, V>(map: Record<K, V>, search: K): V | null {
  return map[search] ?? null;
}

export function fillTemplateString(template: string, values: Record<string, string>): string {
  let filledTemplate = template;

  for (const key in values) {
    const keyTemplate = `__${key}__`;
    const value = values[key];
    filledTemplate = filledTemplate.replaceAll(keyTemplate, value);
  }

  return filledTemplate;
}

export function fillTemplateTranslation(template: Translation, values: Record<string, string>): Translation {
  const filledTranslation = { ...template };

  for (const locale in template) {
    filledTranslation[locale as Locale] = fillTemplateString(template[locale as Locale], values);
  }

  return filledTranslation;
}

export function fillTranslatableObject(
  translatable: Record<string, Translation>,
  values: Record<string, string>,
): Record<string, Translation> {
  const translated = { ...translatable };

  for (const key in translatable) {
    translated[key] = fillTemplateTranslation(translatable[key], values);
  }

  return translated;
}
