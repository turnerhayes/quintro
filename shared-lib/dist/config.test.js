var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
describe("shared-lib", () => {
    describe("config", () => {
        beforeEach(() => {
            delete process.env.WEB_SOCKETS_URL;
            jest.resetModules();
        });
        it("should use the WEB_SOCKETS_URL environment variable as the websockets URL if defined", async () => {
            const url = "/foo/bar";
            process.env.WEB_SOCKETS_URL = url;
            const Config = await Promise.resolve().then(() => __importStar(require("./config")));
            expect(Config.websockets.url).toBe(url);
        });
        it("should use the root path if the WEB_SOCKETS_URL environment variable is not defined", async () => {
            const Config = await Promise.resolve().then(() => __importStar(require("./config")));
            expect(Config.websockets.url).toBe("/");
        });
    });
});
