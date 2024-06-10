
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

    // Used to determine whose turn is it (white or black). Starts with white.
    #side = 'w';

    // The maximum steps a piece can go on the chessboard.
    #MAX_STEPS = 7;

    // The maximum number of squares a rank, a file or a diagonal can have.
    #MAX_SQUARES = 8;

    // The move object that stores the starting and ending positions of a piece plus extra data regarding the move.
    #move = {'from': {'rank': '', 'file': ''}, 'to': {'rank': '', 'file': ''}, 'piece': '', 'captured': false};

    // The pieces on the board.
    #pieces = [];

    constructor(board) {
        this.#board = board !== undefined ? board : this.#board;
        this.#setPieces();
    }

    #setPieces() {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

        // Loop through the 2 dimensional board array.
        for (let i = 0; i < this.#board.length; i++) {
            for (let j = 0; j < this.#board[i].length; j++) {
                // A piece is on the square.
                if (this.#board[i][j]) {
                    const type = this.#board[i][j].charAt(0);
                    const side = this.#board[i][j].charAt(1);
                    const position = files[j] + ranks[i];
                    let piece;

                    switch (type) {
                        case 'K':
                            piece = new King(this, side, position);
                            break;

                        case 'Q':
                            piece = new Queen(this, side, position);
                            break;

                        case 'R':
                            piece = new Rook(this, side, position);
                            break;

                        case 'B':
                            piece = new Bishop(this, side, position);
                            break;

                        case 'N':
                            piece = new Knight(this, side, position);
                            break;

                        case 'P':
                            piece = new Pawn(this, side, position);
                            break;
                    }

                    this.#pieces.push(piece);
                }
            }
        }
    }

    getPieces() {
        return this.#pieces;
    }

    switchSides() {
        this.#side = this.#side == 'w' ? 'b' : 'w';
    }

    whoseTurnIsIt() {
        return this.#side;
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

    playMove(piece, position, newPiece) {

        if (this.getSquare(position)) {
            //this._(_key).move.capture = true;
        }

        // Check for promoted pawn.
        if (newPiece !== undefined) {
            // Replace the promoted pawn by the selected piece.
            //this._(_key).move.piece = newPiece;
        }

        //this.#updateBoard(piece, position);
        // Update the piece position on the chessboard.
        this.#board[this.#coordinates[position.charAt(1)]][this.#coordinates[position.charAt(0)]] = '';
        this.#board[this.#coordinates[position.charAt(1)]][this.#coordinates[position.charAt(0)]] = piece.getCode();

        //_setHistory(this._);
        //this.resetMove();

        this.switchSides();
    }
}
