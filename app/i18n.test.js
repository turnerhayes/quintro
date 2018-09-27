import {
	formatTranslationMessages,
} from "./i18n";

const enMessages = {
	"quintro.general.actions.logIn": "Log in",
	"quintro.components.TopNavigation.links.home": "Home",
};

describe("i18n", () => {
	describe("formatTranslationMessages", () => {
		it("should default to `en` locale messages", () => {
			const messages = formatTranslationMessages("de", {
				"quintro.general.actions.logIn": undefined,
				"quintro.components.TopNavigation.links.home": "Startseite",
			});
			
			expect(messages).toEqual({
				"quintro.general.actions.logIn": enMessages["quintro.general.actions.logIn"],
				"quintro.components.TopNavigation.links.home": "Startseite",
			});
		});
	});

	describe("translationMessages", () => {
		it("should contain locale messages for all app locales", async () => {
			jest.resetModules();

			jest.doMock("@app/translations/en", () => {
				return enMessages;
			});

			const { translationMessages } = await import("./i18n");

			expect(translationMessages).toEqual({
				en: enMessages,
			});
		});
	});
});
