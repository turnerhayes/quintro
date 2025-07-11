import { Stack, Box } from "@mui/material";
import { Outlet } from "react-router";
import { App } from "@/components/App";
import { TopNav } from "@/components/TopNav";

const LayoutComponent = () => {
    return (
        <App>
            <Stack
                direction="column"
                sx={{
                    width: "100%",
                    height: "100%",
                }}
            >
                <TopNav
                />
                <Box
                    overflow="auto"
                    flex={1}
                >
                    <Outlet/>
                </Box>
            </Stack>
        </App>
    );
};

export default LayoutComponent;
