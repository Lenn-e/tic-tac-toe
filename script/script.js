const UIRender = (() => {
    const boardDisplay = document.querySelector(".game-board");

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

    return {
        renderBoard,
        resetBoard
    }
})();

// used for tracking board state
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

const Player = (playerSide) => {
    let side = playerSide;
    let score = 0;
    
    return {
        side
    };
};

// used for controlling the game flow
const game = (() => {
    let player1;
    let player2;
    let currentPlayer;

    const newGame = () => {
        player1 = Player('X');
        player2 = Player('O');
        currentPlayer = player1;
    }

    const newRound = () => {
        board.reset()
    }

    const checkRoundState = () => {
        if(board.checkWinner(currentPlayer)) {
            // write win logic
            console.log(`${currentPlayer.side} won this round!`)
            newRound();
            return true;
        } else if(board.checkDraw()) {
            console.log("It's a draw");
            newRound();
            return true;
        }
        return false;
    }

    const makeMove = (row, column) => {
        if(board.registerMove(currentPlayer, row, column)) {
            // the move was legal so check for win or draw
            let isGameOver = checkRoundState();
            // if the game hasn't ended switch to next player
            currentPlayer = currentPlayer === player1 ? player2 : player1;
            
            // return boolean that lets the controller know if the game is over
            return isGameOver;
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

    const squareClick = (e) => {
        let square = e.target;
        if(Array.from(square.classList).includes("board-square")) {
            // extract coordinates from the element's data attribute
            let coordinates = square.getAttribute("data-coordinate").split('-');
            let squareRow = coordinates[0];
            let squareCol = coordinates[1];
            // check if square is taken
            if(square.textContent != 'X' && square.textContent != 'O') {
                square.textContent = game.getCurrentPlayer().side;
                // if the round has ended
                if(game.makeMove(squareRow, squareCol)) {
                    // write code that redraws the board
                    UIRender.resetBoard();
                }
            }
        }
    }

    const connectHandlers = () => {
        boardDisplay.addEventListener('click', squareClick);
    }

    return {
        connectHandlers
    };
})();

UIRender.renderBoard();
game.newGame();
displayController.connectHandlers();