"use strict";

const { OAuth2App } = require("homey-oauth2app");
const TuyaOAuth2Client = require("./TuyaOAuth2Client");
const TuyaOAuth2Util = require("./TuyaOAuth2Util");

class TuyaOAuth2App extends OAuth2App {
  static OAUTH2_CLIENT = TuyaOAuth2Client;
  static OAUTH2_DEBUG = process.env.DEBUG === "1";
  static OAUTH2_MULTI_SESSION = false; // TODO: Enable this feature & make nice pairing UI

  async onOAuth2Init() {
    await super.onOAuth2Init();

    const sendCommandRunListener = async ({ device, code, value }) => {
      if (typeof code === "object") code = code.id;
      await device.sendCommand({ code, value });
    };

    const generalControlAutocompleteListener = async (query, args, filter) => {
      const status = await args.device.getStatus();
      return status
        .filter(filter)
        .filter(({ code }) => {
          return code.toLowerCase().includes(query.toLowerCase());
        })
        .map(({ code }) => ({
          id: code,
          title: code,
        }));
    };

    // Register Tuya Web API Flow Cards
    // Sending
    this.homey.flow
      .getActionCard("send_command_string")
      .registerRunListener(async (args) => sendCommandRunListener(args))
      .registerArgumentAutocompleteListener("code", async (query, args) =>
        generalControlAutocompleteListener(query, args, ({ value }) => {
          return (
            typeof value === "string" && !TuyaOAuth2Util.hasJsonStructure(value)
          );
        }),
      );

    this.homey.flow
      .getActionCard("send_command_number")
      .registerRunListener(async (args) => sendCommandRunListener(args))
      .registerArgumentAutocompleteListener("code", async (query, args) =>
        generalControlAutocompleteListener(query, args, ({ value }) => {
          return typeof value === "number";
        }),
      );

    this.homey.flow
      .getActionCard("send_command_boolean")
      .registerRunListener(async (args) => sendCommandRunListener(args))
      .registerArgumentAutocompleteListener("code", async (query, args) =>
        generalControlAutocompleteListener(query, args, ({ value }) => {
          return typeof value === "boolean";
        }),
      );

    this.homey.flow
      .getActionCard("send_command_json")
      .registerRunListener(async ({ device, code, value }) => {
        if (typeof code === "object") code = code.id;

        await device.sendCommand({
          code,
          value: JSON.parse(value),
        });
      })
      .registerArgumentAutocompleteListener("code", async (query, args) =>
        generalControlAutocompleteListener(query, args, ({ value }) => {
          return (
            typeof value === "object" || TuyaOAuth2Util.hasJsonStructure(value)
          );
        }),
      );

    // Receiving
    this.homey.flow
      .getDeviceTriggerCard("receive_status_boolean")
      .registerRunListener((args, state) => args.code.id === state.code)
      .registerArgumentAutocompleteListener("code", async (query, args) =>
        generalControlAutocompleteListener(query, args, ({ value }) => {
          return typeof value === "boolean";
        }),
      );

    this.homey.flow
      .getDeviceTriggerCard("receive_status_json")
      .registerRunListener((args, state) => args.code.id === state.code)
      .registerArgumentAutocompleteListener("code", async (query, args) =>
        generalControlAutocompleteListener(query, args, ({ value }) => {
          return (
            typeof value === "object" || TuyaOAuth2Util.hasJsonStructure(value)
          );
        }),
      );

    this.homey.flow
      .getDeviceTriggerCard("receive_status_number")
      .registerRunListener((args, state) => args.code.id === state.code)
      .registerArgumentAutocompleteListener("code", async (query, args) =>
        generalControlAutocompleteListener(query, args, ({ value }) => {
          return typeof value === "number";
        }),
      );

    this.homey.flow
      .getDeviceTriggerCard("receive_status_string")
      .registerRunListener((args, state) => args.code.id === state.code)
      .registerArgumentAutocompleteListener("code", async (query, args) =>
        generalControlAutocompleteListener(query, args, ({ value }) => {
          return (
            typeof value === "string" && !TuyaOAuth2Util.hasJsonStructure(value)
          );
        }),
      );
  }
}

module.exports = TuyaOAuth2App;
