
class PlayGame {
    #chessboard;

    constructor(chessboard) {
        this.#chessboard = chessboard;
    }


    pawn(move) {
        const step = stepable(this.#chessboard, this.#chessboard.whoseTurnIsIt());

        // The possible capture is disambiguated by providing the file letter (the first character).
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
