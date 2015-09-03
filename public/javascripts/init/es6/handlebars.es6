import Handlebars from "handlebars";
import getHelpers from "../../../hbs-helpers";

var helpers = getHelpers(Handlebars);

function init() {
	Handlebars.registerHelper(
		helpers
	);
}

export default init;
