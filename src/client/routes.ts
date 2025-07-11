import {
  type RouteConfig,
  route,
  layout,
  index,
} from "@react-router/dev/routes";

export default [
  layout("./layout.tsx", [
    index("./routes/home.tsx"),
    route("game/find", "./routes/find-game.tsx"),
    route("game/create", "./routes/create-game.tsx"),
    route("game/play/:gameName", "./routes/play-game.tsx"),
    route("how-to-play", "./routes/how-to-play.tsx"),
    route("sandbox", "./routes/sandbox.tsx"),
    route("*?", "./catchall.tsx"),
  ]),
] satisfies RouteConfig;
