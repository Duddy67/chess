
class PlayGame {
    #chessboard;
    // Regexes used to parse the given moves.
    #parsers = {
        P_move: /^[a-h]{1}[0-8]{1}[\+|\-]?$/, 
        P_capture_dsbg: /^[a-h]{1}x[a-h]{1}[0-8]{1}[\+|\-]?$/,
        R_move: /^R[a-h]{1}[0-8]{1}[\+|\-]?$/,
        R_move_dsbg: /^R[a-h]{2}[0-8]{1}[\+|\-]?$/,
        R_capture: /^Rx[a-h]{1}[0-8]{1}[\+|\-]?$/,
        R_capture_dsbg: /^R[a-h]{1}x[a-h]{1}[0-8]{1}[\+|\-]?$/,
        N_move: /^N[a-h]{1}[0-8]{1}[\+|\-]?$/,
        N_move_dsbg: /^N[a-h]{2}[0-8]{1}[\+|\-]?$/,
        N_capture: /^Nx[a-h]{1}[0-8]{1}[\+|\-]?$/,
        N_capture_dsbg: /^N[a-h]{1}x[a-h]{1}[0-8]{1}[\+|\-]?$/,
        B_move: /^B[a-h]{1}[0-8]{1}[\+|\-]?$/,
        B_capture: /^Bx[a-h]{1}[0-8]{1}[\+|\-]?$/,
        Q_move: /^Q[a-h]{1}[0-8]{1}[\+|\-]?$/,
        Q_capture: /^Qx[a-h]{1}[0-8]{1}[\+|\-]?$/,
        K_move: /^K[a-h]{1}[0-8]{1}[\+|\-]?$/,
        K_capture: /^Kx[a-h]{1}[0-8]{1}[\+|\-]?$/,
        C_king_side: /^O-O[\+|\-]?$/,
        C_queen_side: /^O-O-O[\+|\-]?$/,
    };

    constructor(chessboard) {
        this.#chessboard = chessboard;
    }

    #parseMove(move) {
        const parsing = {move: move};

        // Both + and - signs are sometimes used to indicate a decisive advantage for a side or the other.    
        parsing.advantage = move.slice(-1) == '+' || move.slice(-1) == '-' ? move.slice(-1) : '';

        // Remove the possible advantage notation right away to prevent parsing errors..
        if (parsing.advantage) {
            move = move.substring(0, move.length - 1);
        }

        // Check for pawn promotion. The penultimate character of the string. "=" means the pawn is promoted.
        // In case of promotion, get the last character which is the letter of the new piece (Q, R...) concatenated with the side code.
        parsing.promotion = move.substring(move.length - 2, move.length - 1) == '=' ? move.slice(-1) + this.#chessboard.whoseTurnIsIt() : undefined;

        // Remove the possible promotion notation.
        if (parsing.promotion !== undefined) {
            move = move.substring(0, 2);
        }

        // 2 disambiguating types are possible. Regular move (eg: Rbc8) or capture (eg: Rbxc8).
        // In both cases the second letter is the file letter.
        parsing.disambiguating = (move.length == 4 && move.charAt(1) != 'x') || move.length == 5 ? move.charAt(1) : '';

        // Disambiguating might be used for pawns during capturing. But unlike the other pieces, no piece 
        // letter (in uppercase) is provided in notation. 
        // Thus the first character of the string becomes the disambiguating letter in lowercase (eg: bxc5).
        parsing.disambiguating = move.length == 4 && /^[a-h]/.test(move) && move.charAt(1) == 'x' ? move.charAt(0) : parsing.disambiguating;

        // Remove the possible disambiguating notation (as well as the piece letter).
        if (parsing.disambiguating) {
            const startIndex = move.length == 4 ? 2 : 3;
            move = move.substring(startIndex);
        }

        // Remove the piece letter (R, N, Q...) and possibly the x from the regular moves (eg: Rc8, Rxc8).
        if (move.length == 3 || move.length == 4) {
            const startIndex = move.length == 3 ? 1 : 2;
            move = move.substring(startIndex);
        }

        // Store the ending position as a 2 characters coordinate (eg: a5, g2...).
        parsing.position = move;

        return parsing;
    }

    #playMove(piece, parsing, directions, steps) {
        // 
        steps = steps === undefined ? this.#chessboard.getMaxSquares() : steps;

        // Use the movable function to find out the piece's starting position.
        const mvb = movable(this.#chessboard, this.#chessboard.whoseTurnIsIt());
        let startingPosition;

        // Get the starting position by testing the moves from each direction.
        // Note: The main loop is labeled as "search" in order to break the nested loops.
        search: for (let i = 0; i < directions.length; i++) {
                    // Get the possible moves in the given direction.
                    let moves = mvb.getMoves(parsing.position, directions[i], steps, true);

                    // Test each move.
                    for (let j = 0; j < moves.length; j++) {
                        // Check possible disambiguating.
                        if (parsing.disambiguating && parsing.disambiguating != moves[j].charAt(0)) {
                            continue;
                        }

                        let square = this.#chessboard.getSquare(moves[j]);

                        // A friendly piece is in the way. The piece can't go any further.
                        if (square.charAt(1) == this.#chessboard.whoseTurnIsIt() && square.charAt(0) != piece) {
                            // Stop searching in this direction.
                            break;
                        }

                        if (square == piece + this.#chessboard.whoseTurnIsIt()) {
                            startingPosition = moves[j];
                            break search;
                        }
                    }
                }

        // Get the piece object.
        piece = this.#chessboard.getPieceAtPosition(startingPosition);
        // Move the piece.
        this.#chessboard.movePiece(piece, parsing.position);

        parsing.start = startingPosition;

        return parsing;
    }

    king(move) {
        // Get the parsing of the move.
        const parsing = this.#parseMove(move);

        // Set the directions the king is allowed to go.
        const directions = ['right-diagonal-forward', 'left-diagonal-forward', 
                            'right-diagonal-backward', 'left-diagonal-backward',
                            'forward', 'backward', 'right', 'left'
        ];

        return this.#playMove('K', parsing, directions, 1);
    }

    queen(move) {
        // Get the parsing of the move.
        const parsing = this.#parseMove(move);

        // Set the directions the queen is allowed to go.
        const directions = ['right-diagonal-forward', 'left-diagonal-forward', 
                            'right-diagonal-backward', 'left-diagonal-backward',
                            'forward', 'backward', 'right', 'left'
        ];

        return this.#playMove('Q', parsing, directions);
    }

    bishop(move) {
        // Get the parsing of the move.
        const parsing = this.#parseMove(move);

        // Set the directions the bishop is allowed to go.
        const directions = ['right-diagonal-forward', 'left-diagonal-forward',
                            'right-diagonal-backward', 'left-diagonal-backward'
        ];

        return this.#playMove('B', parsing, directions);
    }

    rook(move) {
        // Get the parsing of the move.
        const parsing = this.#parseMove(move);

        // Set the directions the rook is allowed to go.
        const directions = ['forward', 'backward', 'right', 'left'];

        return this.#playMove('R', parsing, directions);
    }

    knight(move) {
        // Use the movable function to find out the piece's starting position.
        const mvb = movable(this.#chessboard, this.#chessboard.whoseTurnIsIt());

        // Get the parsing of the move.
        const parsing = this.#parseMove(move);

        // Arrays to used simultaneously to get the possible directions for a knight.
        const lftRgt = [['left', 'right'], ['left', 'right']];
        const fwdBwd = ['forward', 'backward'];
        let startingPosition;

        // Note: Knight moves are too specific. So they are treated separately.

        // Find out the starting position by testing the moves from different directions.
        search: for (let i = 0; i < lftRgt.length; i++) {
                    for (let j = 0; j < lftRgt[i].length; j++) {
                        // First move: Go 2 steps forward or backward skipping over the possible pieces in the way.
                        let steps = 2;
                        let moves = mvb.getMoves(parsing.position, fwdBwd[i], steps, true);
                        let tmpPosition;

                        // Check for boundary effect (ie: the number of moves must be equal to the number of steps).
                        if (moves.length == 2) {
                            // Get the last element (ie: position) of the array.
                            tmpPosition = moves[moves.length - 1];
                            steps = 1;
                            // Then from there, go 1 step to the left or to the right. 
                            moves = mvb.getMoves(tmpPosition, lftRgt[i][j], steps, true);

                            // Check again for boundary effect.
                            if (moves.length == 1 && moves[0] != tmpPosition) {
                                let square = this.#chessboard.getSquare(moves[0]);

                                if (square == 'N' + this.#chessboard.whoseTurnIsIt()) {
                                    // Make sure there is no disambiguating or that the disambiguating letter matches the starting position.
                                    if (!parsing.disambiguating || (parsing.disambiguating && parsing.disambiguating == moves[0].charAt(0))) {
                                        startingPosition = moves[0];
                                        break search;
                                    }
                                }
                            }
                        }

                        // Second move: Now go 1 step forward or backward skipping over the possible pieces in the way.
                        steps = 1;
                        moves = mvb.getMoves(parsing.position, fwdBwd[i], steps, true);

                        // Check for boundary effect.
                        if (moves.length == 1 && moves[0] != parsing.position) {
                            tmpPosition = moves[0];
                            steps = 2;

                            // Then from there, go 2 step to the left or to the right. 
                            moves = mvb.getMoves(tmpPosition, lftRgt[i][j], steps, true);
                            // Check for boundary effect (ie: the number of moves must be equal to the number of steps).
                            if (moves.length == 2) {

                                let square = this.#chessboard.getSquare(moves[1]);

                                if (square == 'N' + this.#chessboard.whoseTurnIsIt()) {
                                    // Make sure there is no disambiguating or that the disambiguating letter matches the starting position.
                                    if (!parsing.disambiguating || (parsing.disambiguating && parsing.disambiguating == moves[1].charAt(0))) {
                                        startingPosition = moves[1];
                                        break search;
                                    }
                                }
                            }
                        }
                    }
                }

        // Get the knight object.
        const knight = this.#chessboard.getPieceAtPosition(startingPosition);
        // Move the knight.
        this.#chessboard.movePiece(knight, parsing.position);

        parsing.start = startingPosition;

        return parsing;
    }

    pawn(move) {
        // Get the parsing of the move.
        const parsing = this.#parseMove(move);
        // Get the destination square.
        let square = this.#chessboard.getSquare(parsing.position);

        // A piece has been captured by the pawn. 
        // Check the disambiguating variable which is also used for a possible "en passant" move. 
        if (square || parsing.disambiguating) {
            // Go one step backward right and left in diagonal to get the starting position of the pawn.
            return this.#playMove('P', parsing, ['right-diagonal-backward', 'left-diagonal-backward'], 1);
        }
        // Pawn regular move.
        else {
            // Go one or two steps backward to get the starting position of the pawn.
            return this.#playMove('P', parsing, ['backward'], 2);
        }
    }

    castling(move) {
        // Infer the castling position from both the castling type and the playing side. 

        // Get the file letter according to the castling type: kingside (O-O) or queenside(O-O-O).
        let file = move == 'O-O' ? 'g' : 'c';
        const rank = this.#chessboard.whoseTurnIsIt() == 'w' ? '1' : '8';
        // Get the king's initial position.
        const startingPosition = 'e' + rank;
        const endingPosition = file + rank;

        // Get the king object.
        const king = this.#chessboard.getPieceAtPosition(startingPosition);
        // Castle.
        this.#chessboard.movePiece(king, endingPosition);

        // Create a parsing object to store the starting and ending positions of the kink and the rook.
        const parsing = {move: move, king_start: startingPosition, king_end: endingPosition}

        file = move == 'O-O' ? 'h' : 'a';
        parsing.rook_start = file + rank;
        file = move == 'O-O' ? 'f' : 'd';
        parsing.rook_end = file + rank;

        return parsing;
    }

    getParsers() {
        return this.#parsers;
    }

    /*
     * Run the given pgn from start to end in one go.
     */
    runPuzzle(pgn) {
        let moves = pgn.split(' ');
moves = moves.slice(0, 25);
        const parsings = []; 
        // The functions associated with the piece letter.
        const functions = {P: 'pawn', R: 'rook', N: 'knight', B: 'bishop', Q: 'queen', K: 'king', C: 'castling'};

        for (let i = 0; i < moves.length; i++) {
            for (let [key, regex] of Object.entries(this.#parsers)) {
                if (regex.test(moves[i])) {
                    // Execute the appropriate function according to the piece letter (key) returned by the parser.
                    let parsing = this[functions[key.charAt(0)]](moves[i]);
                    parsings.push(parsing);
                }
            }
        }

        return parsings;
    }
}
