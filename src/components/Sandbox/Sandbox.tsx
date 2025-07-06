export const Sandbox = (
    {
        classes,
    }: {
        classes?: {
            root?: string;
            boardContainer?: string;
            board?: string;
        };
    }
) => {
    // const quintros = gameSelectors.getQuintros(this.state.game);
    // const gameIsOver = gameSelectors.isOver(this.state.game);
    // const isStoredGame = this.state.storedGame && is(this.state.game, this.state.storedGame);
    // const isEmptyGame = is(this.state.game, emptyGame);
    // const isDirty = !isEmptyGame && !isStoredGame;

    
    // const speedDialActions = [
    //     {
    //         name: "Edit game",
    //         icon: (
    //             <EditIcon />
    //         ),
    //         handler: this.handleEditGameClick,
    //     },

    //     {
    //         name: `${this.state.shouldShowMoveList ? "Hide" : "Show"} move list`,
    //         icon: this.state.shouldShowMoveList ?
    //             (
    //                 <ShowingMoveListIcon />
    //             ) :
    //             (
    //                 <NotShowingMoveListIcon />
    //             ),
    //         handler: this.handleShowMoveListClick,
    //     },
    // ];
    
    // if (!isEmptyGame) {
    //     speedDialActions.push({
    //         name: "Reset game",
    //         icon: (
    //             <ClearIcon />
    //         ),
    //         handler: this.handleResetGameButtonClick,
    //     });
    // }

    // if (isDirty) {
    //     speedDialActions.push({
    //         name: "Store game",
    //         icon: (
    //             <SaveIcon />
    //         ),
    //         handler: this.handleSaveGameClick,
    //     });
    // }

    // if (this.state.storedGame !== null) {
    //     if (!isStoredGame) {
    //         speedDialActions.push({
    //             name: "Restore stored game",
    //             icon: (
    //                 <RestoreIcon />
    //             ),
    //             handler: this.handleRestoreGameClick,
    //         });
    //     }

    //     speedDialActions.push({
    //         name: "Remove stored game",
    //         icon: (
    //             <DeleteIcon />
    //         ),
    //         handler: this.handleClearGameButtonClick,
    //     });
    // }

    return (
        <div
            className={classes?.root}
        >
            {/* {this.state.shouldShowGameControls && this.renderGameControls()} */}
            <div
                className={classes?.boardContainer}
            >
                <div
                    className={classes?.board}
                >
                    {/* <Board
                        board={this.state.game.get("board")}
                        allowPlacement={
                            !this.state.game.get("players").isEmpty() &&
                            this.state.game.get("isStarted") &&
                            !gameIsOver
                        }
                        onCellClick={this.handleCellClick}
                        quintros={quintros}
                        gameIsOver={gameIsOver}
                    /> */}
                </div>
                {/* <ClickAwayListener
                    onClickAway={this.handleSpeedDialClickAway}
                >
                    <SpeedDial
                        classes={{
                            root: this.props.classes.speedDial,
                        }}
                        open={this.state.isSpeedDialOpen}
                        onClick={this.handleSpeedDialClick}
                        icon={(
                            <SpeedDialIcon
                                classes={{
                                    icon: this.props.classes.speedDialIcon,
                                }}
                            />
                        )}
                        ariaLabel="Game actions"
                    >
                        {
                            speedDialActions.map(
                                (action) => (
                                    <SpeedDialAction
                                        key={action.name}
                                        icon={action.icon}
                                        tooltipTitle={action.name}
                                        onClick={action.handler}
                                    />
                                )
                            )
                        }
                    </SpeedDial>
                </ClickAwayListener> */}
                {/* {
                    this.state.shouldShowMoveList && (
                        <MoveList
                            classes={{
                                root: this.props.classes.moveList,
                            }}
                            game={this.state.game}
                            onSelectMove={this.handleSelectMove}
                        />
                    )
                } */}
            </div>
        </div>
    );
};
