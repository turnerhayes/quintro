import $                 from "jquery";
import initHandlebars    from "./init/handlebars";
import ViewStarter       from './view-starter';

initHandlebars();

ViewStarter.run($(document.body));
