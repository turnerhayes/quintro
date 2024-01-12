exports = [
    {
        path: "/",
        children: [
            {
                index: true,
            },
            {
                path: "game",
                children: [
                    {
                        path: "find",
                    },
                    {
                        path: "create",
                    },
                ],
            },
            {
                path: "play",
                children: [
                    {
                        path: ":gameName",
                    },
                ],
            },
            {
                path: "how-to-play",
            },
            {
                path: "sandbox",
            }
        ]
    }
];
