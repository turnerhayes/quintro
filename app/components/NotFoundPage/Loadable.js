/**
 * Asynchronously loads the component for NotFoundPage
 */
import Loadable from "react-loadable";

export default Loadable({
	loader: () => import("./NotFoundPage"),
	loading: () => null,
});
