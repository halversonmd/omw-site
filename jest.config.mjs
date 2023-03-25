/** @type {import('jest').Config} */
export default {
  preset: "@quasar/quasar-app-extension-testing-unit-jest",
  transform: {
    ".*\\.js$": "babel-jest",
  },
  setupFiles: ["dotenv/config"],
};
