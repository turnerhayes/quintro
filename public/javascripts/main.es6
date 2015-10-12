import $                 from "jquery";
import initHandlebars    from "./init/es6/handlebars";
import ViewStarter       from './view-starter';

initHandlebars();

ViewStarter.run($(document.body));
