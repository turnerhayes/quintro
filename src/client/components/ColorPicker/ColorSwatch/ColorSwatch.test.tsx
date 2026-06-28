/// <reference types="@vitest/browser-playwright" />

import { describe, expect, it } from "vitest";
import { render } from "@/client/testing/test-utils";
import { ColorSwatch } from "@/client/components/ColorPicker/ColorSwatch";

describe('ColorSwatch component', () => {
    it('should render correctly', async () => {
        const {baseElement} = render(
            <ColorSwatch color="red" />
        );

        await expect(baseElement).toMatchScreenshot();
    });
});
