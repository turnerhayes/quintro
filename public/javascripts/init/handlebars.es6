import Handlebars from "hbsfy/runtime";
import getHelpers from "../../hbs-helpers";

function init() {
	Handlebars.registerHelper(getHelpers(Handlebars));
}

export default init;
