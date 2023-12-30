"use strict";

//export const NON_PLAYABLE_FIELD = 0;
export const EMPTY              = 1;
export const PLAYER_A           = 2;
export const PLAYER_B           = 3;

export class Checkers
{

    /**
     * Startup state of the game
     */
    initialBoard = [
        [0, 2, 0, 2, 0, 2, 0, 2, 0, 2],
        [2, 0, 2, 0, 2, 0, 2, 0, 2, 0],
        [0, 2, 0, 2, 0, 2, 0, 2, 0, 2],
        [2, 0, 2, 0, 2, 0, 2, 0, 2, 0],
        [0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
        [0, 3, 0, 3, 0, 3, 0, 3, 0, 3],
        [3, 0, 3, 0, 3, 0, 3, 0, 3, 0],
        [0, 3, 0, 3, 0, 3, 0, 3, 0, 3],
        [3 ,0 ,3 ,0 ,3 ,0 ,3 ,0 ,3 ,0]
    ];

    // initialBoard = [
    //     [1, 0, 3, 0, 1, 0, 1, 0, 1, 0],
    //     [0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    //     [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    //     [0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    //     [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    //     [0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    //     [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    //     [0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    //     [1, 0, 2, 0, 1, 0, 1, 0, 1, 0],
    //     [0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    // ]


    /**
     * The current state of the game
     * @type {null}
     */
    currentBoard = null;

    /**
     * Either a or b, start with a
     * @type {number}
     */
    currentPlayer = 2;

    /**
     * HTML element to display the board
     * @type {string}
     */
    boardElementId = '';

    /**
     * HTML element to display game information
     * @type {string}
     */
    infoElementId = '';

    /**
     * Expects the ID's for the HTML elements to display the game and game information
     * @param boardElementId
     * @param infoElementId
     */
    constructor(boardElementId, infoElementId){
        this.currentBoard = this.initialBoard;
        this.currentPlayer = 2;
        this.boardElementId = boardElementId;
        this.infoElementId = infoElementId;
        this.displayBoard();
    }

    /**
     * Based on the game state in the multidimensional array currentBoard it wil (re) create
     * the HTML for the game. And adds all the necessary event listeners to drag and drop the
     * disks.
     */
    displayBoard()
    {
        // build the HTML
        let element = document.getElementById(this.boardElementId);
        let template = '';
        for(let r=0; r < 10 ; r++){
            template += `<div class="row" id="${r}">`;
            for(let c=0; c < 10 ; c++){
                let content = '&nbsp;'
                if (this.currentBoard[r][c] === PLAYER_A) {
                    content = `<span id="player-a-${r}-${c}" data-row="${r}" data-col="${c}" draggable="true" class="player a">&nbsp;</span>`;
                } else if (this.currentBoard[r][c] === PLAYER_B) {
                    content = `<span id="player-a-${r}-${c}" data-row="${r}" data-col="${c}" draggable="true" class="player b">&nbsp;</span>`;
                }
                template += `<div data-row="${r}" data-col="${c}"  class="cell state-${this.currentBoard[r][c]}" id="cell-${r}-${c}">${content}</div>`;
            }
            template += `</div>`;
        }
        element.innerHTML = template;

        // add listener for the start drag event on the current active players disk only
        let disks = document.getElementsByClassName('player');
        for (let i = 0; i < disks.length; i++) {
            disks[i].addEventListener('dragstart', (event) => {
                this.info('');
                event.dataTransfer.dropEffect = "move";
                event.dataTransfer.setData("text/plain", JSON.stringify(event.currentTarget.dataset));
            });
        }

        // add events on the empty fields to receive the drop
        let cells = document.getElementsByClassName('state-1');
        for (let i = 0; i < cells.length; i++) {
            cells[i].addEventListener('dragover', (event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
            });
            cells[i].addEventListener('drop', (event) => {
                event.preventDefault();
                const from = JSON.parse(event.dataTransfer.getData("text/plain"));
                const to = event.target.dataset;
                this.moveTo(from.row, from.col, to.row, to.col);
            }) ;
        }
    }

    /**
     * Tries to move a disk form one location to another based
     *
     * @param fromRow
     * @param fromCol
     * @param toRow
     * @param toCol
     * @returns {boolean}
     */
    moveTo(fromRow, fromCol, toRow, toCol)
    {
        fromRow = parseInt(fromRow);
        fromCol = parseInt(fromCol);
        toRow   = parseInt(toRow);
        toCol   = parseInt(toCol);

        if (this.currentBoard[fromRow][fromCol] !== this.currentPlayer) {
            this.info("Not your turn!");
            return false;
        }

        let strike = this.strikeOrNot(fromRow, fromCol, toRow, toCol);
        if (strike === 0 ) return false;

        // can only move forwards
        if (strike === -1) {
            let valid = true;
            if (this.currentPlayer === PLAYER_A) {
                valid = (toRow === fromRow+1 && (toCol === fromCol-1 || toCol === fromCol+1));
            } else {
                valid = (toRow === fromRow-1 && (toCol === fromCol-1 || toCol === fromCol+1));
            }
            if (!valid){
                this.info("Invalid move");
                return false;
            }
        }

        this.currentBoard[fromRow][fromCol] = EMPTY;
        this.currentBoard[toRow][toCol] = this.currentPlayer;
        if (!this.validMoves()) window.location.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        this.currentPlayer = (this.currentPlayer === PLAYER_A) ? PLAYER_B: PLAYER_A;
        this.displayBoard();
    }

    /**
     * Strike or not that's the question.
     *
     * Returns -1 if there is nothing to strike
     * Returns 0 if the current player needs to strike
     * Returns 1 if the current player performed succes full strike!
     *
     * @param fromRow
     * @param fromCol
     * @param toRow
     * @param toCol
     * @returns {number}
     */
    strikeOrNot(fromRow, fromCol, toRow, toCol){

        let opponent = (this.currentPlayer === PLAYER_A) ? PLAYER_B: PLAYER_A;
        let strike = [];

        // check if the current player must strike,
        for(let r=0; r < 10; r++){
            for(let c=0; c < 10; c++){
                try {
                    if (this.currentBoard[r][c] !== this.currentPlayer) continue;
                    if (this.currentBoard[r - 1][c - 1] === opponent && this.currentBoard[r - 2][c - 2] === EMPTY) {
                        strike.push([[r - 1, c - 1], [r - 2,c - 2], [r , c]]);
                    } else if (this.currentBoard[r - 1][c + 1] === opponent && this.currentBoard[r - 2][c + 2] === EMPTY) {
                        strike.push([[r - 1, c + 1], [r - 2,c + 2], [r , c]]);
                    } else if (this.currentBoard[r + 1][c - 1] === opponent && this.currentBoard[r + 2][c - 2] === EMPTY) {
                        strike.push([[r + 1, c - 1], [r + 2,c - 2], [r , c]]);
                    } else if (this.currentBoard[r + 1][c + 1] === opponent && this.currentBoard[r + 2][c + 2] === EMPTY) {
                        strike.push([[r + 1, c + 1], [r + 2,c + 2], [r , c]]);
                    }

                } catch(e) { continue;}
            }
        }

        for(let s=0; s < strike.length; s++) {
            if (strike[s][1][0] === toRow && strike[s][1][1] === toCol &&  strike[s][2][0] === fromRow && strike[s][2][1] === fromCol) {
                this.currentBoard[strike[s][0][0]] [strike[s][0][1]] = EMPTY;
                if (this.count(opponent) === 0 ) {
                    window.location.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
                }
                return 1;
            }
        }

        if (strike.length) {
            this.info('You need to strike!');
            return 0;
        }

        return -1;
    }

    /**
     * Display messages from the game in the given HTMl element
     * @param message
     */
    info(message)
    {
        let element = document.getElementById(this.infoElementId);
        if(element){
            element.innerHTML = message;
        } else {
            console.log(message);
        }
    }

    /**
     * Checks if there are any valid moves left for the current player
     */
    validMoves()
    {
        // if player A there must be a piece on a row less than 9 and
        if (this.currentPlayer === PLAYER_A) {
            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    if (this.currentBoard[r][c] === PLAYER_A) {
                        if (this.currentBoard[r+1][c-1] === EMPTY || this.currentBoard[r+1][c-1]) {
                            return true;
                        }
                    }
                }
            }
        }else {
            for (let r = 9; r >0; r--) {
                for (let c = 9; c > 0; c--) {
                    if (this.currentBoard[r][c] === PLAYER_A) {
                        if (this.currentBoard[r-1][c-1] === EMPTY || this.currentBoard[r-1][c-1]) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    /**
     * Counts the fields where the state equals the value of the state parameter
     * @param state
     */
    count(state)
    {
        let t = 0;
        for(let r=0; r < 10; r++){
            for(let c=0; c < 10; c++){
                if (this.currentBoard[r][c] === state) {
                    t++;
                }
            }
        }
        return t;
    }

}