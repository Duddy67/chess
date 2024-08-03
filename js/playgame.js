
class PlayGame {
    #chessboard;

    constructor(chessboard) {
        this.#chessboard = chessboard;
    }


    pawn(move) {
        //console.log(move);
        const step = stepable(this.#chessboard, this.#chessboard.whoseTurnIsIt());
        // The possible capture is disambiguated by providing the file letter (in first position).
        const disambiguating = move.charAt(1) == 'x' ? move.charAt(0) : '';
        // Remove the possible disambiguating notation.
        move = move.length == 4 ? move.substring(2) : move;
        let square = this.#chessboard.getSquare(move);
        let position = move;
        let startingPosition;

        // A piece has been captured by the pawn.
        if (square) {
            // First go one step backward.
            position = step.goOneStepBackward(position);

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
            //console.log(move);

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
        this.#chessboard.movePiece(pawn, move);

    }
}
