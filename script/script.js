const UIRender = (() => {
    const boardDisplay = document.querySelector(".game-board");
    const gameSetupDisplay = document.querySelector(".game-setup");
    const winnerDisplay = document.querySelector(".winner-display");
    const oSideScoreDisplay = document.querySelector(".player-container[data-side=O] .score");
    const xSideScoreDisplay = document.querySelector(".player-container[data-side=X] .score");
    const oSideNameDisplay = document.querySelector(".player-container[data-side=O] .player-name");
    const xSideNameDisplay = document.querySelector(".player-container[data-side=X] .player-name");

    const createSquare = (coordinates) => {
        let square = document.createElement("div");
        square.classList.add("board-square");
        square.setAttribute("data-coordinate", coordinates);
        return square;
    }

    const renderBoard = () => {
        for(let i = 0; i < 3; i++) {
            for(let j = 0; j < 3; j++) {
                boardDisplay.appendChild(createSquare(`${i}-${j}`))
            }
        }
    }

    const clearBoard = () => {
        boardDisplay.innerHTML = '';
    }

    const resetBoard = () => {
        clearBoard();
        renderBoard();
    }

    const resetScores = () => {
        oSideScoreDisplay.textContent = 0;
        xSideScoreDisplay.textContent = 0;
    }

    const resetNames = () => {
        oSideNameDisplay.textContent = 'P2';
        xSideNameDisplay.textContent = 'P1';
    }

    const switchMainDisplay = () => {
        gameSetupDisplay.classList.toggle("hidden");
        boardDisplay.classList.toggle("hidden");
    }

    const displayRoundWinner = (playerName) => {
        if(playerName === 'draw') {
            winnerDisplay.textContent = `It's a draw.`;
        } else {
            winnerDisplay.textContent = `${playerName} won this round!`;
        }
    }

    const updatePlayerNameDisplay = (player) => {
        if(player.side === "X") {
            xSideNameDisplay.textContent = player.name;
        } else {
            oSideNameDisplay.textContent = player.name;
        }
    }

    const updatePlayerScoreDisplay = (playerSide) => {
        if(playerSide === "X") {
            xSideScoreDisplay.textContent = Number(xSideScoreDisplay.textContent) + 1;
        } else {
            oSideScoreDisplay.textContent = Number(oSideScoreDisplay.textContent) + 1;
        }
    }

    const updateRoundWinner = (winner, playerSide=null) => {
        displayRoundWinner(winner);
        // there is no side arg if it was a draw since we aren't increasing the score
        if(playerSide) {
            updatePlayerScoreDisplay(playerSide);
        }
    }

    const clearRoundWinner = () => {
        winnerDisplay.textContent = '';
    }

    const restartGameDisplay = () => {
        resetNames();
        resetScores();
        clearBoard();
        clearRoundWinner();
        switchMainDisplay();
    }

    return {
        renderBoard,
        resetBoard,
        switchMainDisplay,
        displayRoundWinner,
        restartGameDisplay,
        updateRoundWinner,
        updatePlayerNameDisplay
    }
})();

const board = (() => {
    const WINNING_COMBINATIONS = [
        [[0, 0], [0, 1], [0, 2]],
        [[1, 0], [1, 1], [1, 2]],
        [[2, 0], [2, 1], [2, 2]],
        [[0, 0], [1, 0], [2, 0]],
        [[0, 1], [1, 1], [2, 1]],
        [[0, 2], [1, 2], [2, 2]],
        [[0, 0], [1, 1], [2, 2]],
        [[0, 2], [1, 1], [2, 0]],
    ]

    let boardArray = [[], [], []];

    const registerMove = (player, row, column) => {
        // check if the square is empty and write in it then return true so we know if the move was successful
        if(boardArray[row][column] === undefined) {
            boardArray[row][column] = player.side;
            return true;
        } else {
            return false;
        }
    };

    const checkWinner = (player) => {
        // check if one of the winning combinations is met
        return WINNING_COMBINATIONS.some(combination => {
            // do this by checking if every square of the combination is occupied by the same player
            if(combination.every(square => {
                if(boardArray[square[0]][square[1]] === player.side) {
                    return true;
                }
            })) {
                return true;
            }
        });
    }

    const checkDraw = () => {
        for(let i = 0; i < 3; i++) {
            for(let j = 0; j < 3; j++) {
                if(boardArray[i][j] === undefined) {
                    return false;
                }
            }
        }
        return true;
    };

    const reset = () => {
        boardArray = [[], [], []];
    }

    return {
        registerMove,
        checkWinner,
        checkDraw,
        reset
    };
})();

const Player = (playerName, playerSide) => {
    let name = playerName;
    let side = playerSide;
    let score = 0;
    
    return {
        side,
        name,
        score
    };
};

// used for controlling the game flow
const game = (() => {
    let player1;
    let player2;
    let currentPlayer;

    const newGame = (p1name, p2name) => {
        player1 = Player(p1name, 'X');
        UIRender.updatePlayerNameDisplay(player1);
        player2 = Player(p2name, 'O');
        UIRender.updatePlayerNameDisplay(player2);
        currentPlayer = player1;
    }

    const newRound = () => {
        board.reset()
    }

    const roundWon = () => {
        currentPlayer.score++;
        UIRender.updateRoundWinner(currentPlayer.name, currentPlayer.side);
        newRound();
        return true;
    }

    const roundDraw = () => {
        UIRender.updateRoundWinner('draw');
        newRound();
        return true;
    }

    const checkRoundState = () => {
        // return true if round is over
        if(board.checkWinner(currentPlayer)) {
            return roundWon();
        } else if(board.checkDraw()) {
            return roundDraw();
        }
        return false;
    }

    const makeMove = (row, column) => {
        if(board.registerMove(currentPlayer, row, column)) {
            // the move was legal so check for win or draw
            let isRoundOver = checkRoundState();
            // if the game hasn't ended switch to next player
            currentPlayer = currentPlayer === player1 ? player2 : player1;
            
            // return boolean that lets the controller know if the round is over
            return isRoundOver;
        } else {
            // do nothing and let the same player make another move
        }

    }

    const getCurrentPlayer = () => {
        return currentPlayer;
    }

    return {
        newGame,
        makeMove,
        getCurrentPlayer
    };
})();

const displayController = (() => {
    const boardDisplay = document.querySelector(".game-board");
    const startGameBtn = document.querySelector(".start-btn");
    const restartGameBtn = document.querySelector(".restart-btn");
    const player1Name = document.querySelector("#player1-name");
    const player2Name = document.querySelector("#player2-name");

    const startGame = (e) => {
        startGameBtn.disabled = true;
        restartGameBtn.disabled = false;
        game.newGame(player1Name.value, player2Name.value);
        UIRender.renderBoard();
        UIRender.switchMainDisplay();
    }

    const restartGame = (e) => {
        startGameBtn.disabled = false;
        restartGameBtn.disabled = true;
        UIRender.restartGameDisplay();
    }

    const squareClick = (e) => {
        let square = e.target;
        if(Array.from(square.classList).includes("board-square")) {
            // extract coordinates from the element's data attribute
            let coordinates = square.getAttribute("data-coordinate").split('-');
            let squareRow = coordinates[0];
            let squareCol = coordinates[1];
            // check if square is taken
            // REFACTOR AS A UIRENDER METHOD
            if(square.textContent != 'X' && square.textContent != 'O') {
                square.textContent = game.getCurrentPlayer().side;
                // if the round has ended
                if(game.makeMove(squareRow, squareCol)) {
                    UIRender.resetBoard();
                }
            }
        }
    }

    const connectHandlers = () => {
        boardDisplay.addEventListener('click', squareClick);
        startGameBtn.addEventListener('click', startGame);
        restartGameBtn.addEventListener('click', restartGame);
    }

    return {
        connectHandlers
    };
})();

displayController.connectHandlers();