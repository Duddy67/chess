
class Chessboard {
    // The board as a 2 dimensional array, with the pieces at their initial position.
    #board = [ 
        ['Rb', 'Nb', 'Bb', 'Qb', 'Kb', 'Bb', 'Nb', 'Rb'],
        ['Pb', 'Pb', 'Pb', 'Pb', 'Pb', 'Pb', 'Pb', 'Pb'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['Pw', 'Pw', 'Pw', 'Pw', 'Pw', 'Pw', 'Pw', 'Pw'],
        ['Rw', 'Nw', 'Bw', 'Qw', 'Kw', 'Bw', 'Nw', 'Rw'],
    ];

    // Maps between the chess ranks and files and the 2 dimensional array indexes.
    #coordinates = {'a': 0, 'b': 1, 'c': 2, 'd': 3, 'e': 4, 'f': 5, 'g': 6, 'h': 7,
                    '1': 7, '2': 6, '3': 5, '4': 4, '5': 3, '6': 2, '7': 1, '8': 0};

    // The maximum steps a piece can go on the chessboard.
    #MAX_STEPS = 7;

    // The maximum number of squares a rank, a file or a diagonal can have.
    #MAX_SQUARES = 8;

    constructor(board) {
        this.#board = board !== undefined ? board : this.#board;
    }

    /*
     * Returns the value of a square (ie: empty or occupied by a piece) at a given position.
     */
    getSquare(position) {
        const rank = position.charAt(1);
        const file = position.charAt(0);

        return this.#board[this.#coordinates[rank]][this.#coordinates[file]];
    }

    getBoard() {
        return this.#board;
    }

    getMaxSteps() {
        return this.#MAX_STEPS;
    }

    getMaxSquares() {
        return this.#MAX_SQUARES;
    }
}
