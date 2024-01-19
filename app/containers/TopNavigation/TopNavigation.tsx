import TopNavigation from "@app/components/TopNavigation";

const TopNavigationContainer = ({
    className,
}: {
    className?: string;
}) => {
    return (
        <TopNavigation
            loggedInUser={undefined}
            className={className}
        />
    );
};

export default TopNavigationContainer;
