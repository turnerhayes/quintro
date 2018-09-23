describe("shared-lib", () => {
	describe("config", () => {
		beforeEach(() => {
			delete process.env.WEB_SOCKETS_URL;
			jest.resetModules();
		});

		it("should use the WEB_SOCKETS_URL environment variable as the websockets URL if defined", async () => {
			const url = "/foo/bar";
			process.env.WEB_SOCKETS_URL = url;
			
			const Config = await import("./config");
			
			expect(Config.websockets.url).toBe(url);
		});
		
		it("should use the root path if the WEB_SOCKETS_URL environment variable is not defined", async () => {
			const Config = await import("./config");

			expect(Config.websockets.url).toBe("/");
		});
	});
});
