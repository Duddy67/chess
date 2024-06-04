
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

    // The maximum steps a piece can go on the chessboard.
    #MAX_STEPS = 7;

    // The maximum number of squares a rank, a file or a diagonal can have.
    #MAX_SQUARES = 8;

    constructor(board) {
        this.#board = board !== undefined ? board : this.#board;
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
