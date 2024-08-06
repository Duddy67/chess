
class PlayGame {
    #chessboard;

    constructor(chessboard) {
        this.#chessboard = chessboard;
    }

    #parseMove(move) {
        const parsing = {};

        // Both + and - signs are sometimes used to indicate a decisive advantage for a side or the other.    
        parsing.advantage = move.slice(-1) == '+' || move.slice(-1) == '-' ? move.slice(-1) : '';

        // Remove the possible advantage notation right away to prevent parsing errors..
        if (parsing.advantage) {
            move = move.substring(0, move.length - 1);
        }

        // 2 disambiguating types are possible. Regular move (eg: Rbc8) or capture (eg: Rbxc8).
        // In both cases the second letter is the file letter.
        parsing.disambiguating = (move.length == 4 && move.charAt(1) != 'x') || move.length == 5 ? move.charAt(1) : '';

        // Remove the possible disambiguating notation.
        if (parsing.disambiguating) {
            const startIndex = move.length == 4 ? 2 : 3;
            move = move.substring(startIndex);
        }

        // Remove the piece letter (R, N, Q...) and possibly the x from the regular moves (eg: Rc8, Rxc8).
        if (move.length == 3 || move.length == 4) {
            const startIndex = move.length == 3 ? 1 : 2;
            move = move.substring(startIndex);
        }

        // Store the ending position as a 2 coordinate characters (eg: a5, g2...).
        parsing.position = move;

        return parsing;
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
    }

    rook(move) {
        // Use the movable function to find out the piece's starting position.
        const mvb = movable(this.#chessboard, this.#chessboard.whoseTurnIsIt());

        // Get the parsing of the move.
        const parsing = this.#parseMove(move);

        // The four possible directions for a rook.
        const directions = ['forward', 'backward', 'right', 'left'];
        let startingPosition;

        // Get the starting position by testing the moves from each direction.
        // Note: The main loop is labeled as "search" in order to break the nested loops.
        search: for (let i = 0; i < directions.length; i++) {
                    // Get the possible moves in the given direction.
                    let moves = mvb.getMoves(parsing.position, directions[i], this.#chessboard.getMaxSquares(), true);

                    // Test each move.
                    for (let j = 0; j < moves.length; j++) {
                        // Check possible disambiguating.
                        if (parsing.disambiguating && parsing.disambiguating != moves[j].charAt(0)) {
                            continue;
                        }

                        let square = this.#chessboard.getSquare(moves[j]);

                        if (square == 'R' + this.#chessboard.whoseTurnIsIt()) {
                            startingPosition = moves[j];
                            break search;
                        }
                    }
                }

        // Get the rook object.
        const rook = this.#chessboard.getPieceAtPosition(startingPosition);
        // Move the rook.
        this.#chessboard.movePiece(rook, parsing.position);
    }

    pawn(move) {
        const step = stepable(this.#chessboard, this.#chessboard.whoseTurnIsIt());

        // Both + and - signs are sometimes used to indicate a decisive advantage for a side or the other.    
        const advantage = move.slice(-1) == '+' || move.slice(-1) == '-' ? move.slice(-1) : '';

        // Remove the possible advantage notation right away to prevent parsing errors..
        if (advantage) {
            move = move.substring(0, move.length - 1);
        }

        // The possible capture is disambiguated by providing the first character as the file letter (eg: axb6).
        // Note: The disambiguating notation is also used for "en passant".
        const disambiguating = move.charAt(1) == 'x' ? move.charAt(0) : '';

        // Check the penultimate character of the string. "=" means the pawn is promoted.
        // In case of promotion, get the last character which is the letter of the new piece (Q, R...) concatenated with the side code.
        const promotion = move.substring(move.length - 2, move.length - 1) == '=' ? move.slice(-1) + this.#chessboard.whoseTurnIsIt() : undefined;

        // Remove the possible disambiguating notation.
        if (disambiguating) {
            move = move.substring(2);
        }

        // Remove the possible promotion notation.
        if (promotion !== undefined) {
            move = move.substring(0, 2);
        }

        let square = this.#chessboard.getSquare(move);
        let position = move;
        let startingPosition;

        // A piece has been captured by the pawn. 
        // Check the disambiguating variable which is also used for possible "en passant". 
        if (square || disambiguating) {
            // First go one step backward.
            position = step.goOneStepBackward(position);

            // Use the provided file letter. 
            if (disambiguating) {
                startingPosition = disambiguating + position.charAt(1);
            }
            else if (this.#chessboard.getSquare(step.goOneStepRight(position)) == 'P' + this.#chessboard.whoseTurnIsIt()) {
                startingPosition = step.goOneStepRight(position);
            }
            else if (this.#chessboard.getSquare(step.goOneStepLeft(position)) == 'P' + this.#chessboard.whoseTurnIsIt()) {
                startingPosition = step.goOneStepLeft(position);
            }

        }
        // Pawn regular move.
        else {
            const steps = 2;

            // Go one or two steps backward to get the starting position of the pawn.
            for (let i = 0; i < steps; i++) {
                startingPosition = step.goOneStepBackward(position);
                square = this.#chessboard.getSquare(startingPosition);

                if (square == 'P' + this.#chessboard.whoseTurnIsIt()) {
                    break;
                }
                else {
                    position = startingPosition;
                }
            }
        }

        // Get the pawn object.
        const pawn = this.#chessboard.getPieceAtPosition(startingPosition);
        // Move the pawn.
        this.#chessboard.movePiece(pawn, move, promotion);
    }
}
