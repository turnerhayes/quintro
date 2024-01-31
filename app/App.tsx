import { signIn, useSession } from "next-auth/react";
import TopNavigation from "@app/containers/TopNavigation";

const App = ({
    locale,
    children,
}: {
    locale: string;
    children: React.ReactNode;
}) => {
    const session = useSession({
        required: true,
        onUnauthenticated() {
            signIn("credentials");
        },
    });
    console.log("session:", session);

    return (
        <html lang={locale}>
            <body>
            <header
                className={"main-header"}
            >
                <TopNavigation
                />
            </header>
            <article
                className="main-content"
            >
                {children}
            </article>
            </body>
        </html>
    );
};

export default App;
