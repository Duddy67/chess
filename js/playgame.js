
class PlayGame {
    #chessboard;

    constructor(chessboard) {
        this.#chessboard = chessboard;
    }


    rook(move) {
        const check = movable(this.#chessboard, this.#chessboard.whoseTurnIsIt());

        // Both + and - signs are sometimes used to indicate a decisive advantage for a side or the other.    
        const advantage = move.slice(-1) == '+' || move.slice(-1) == '-' ? move.slice(-1) : '';

        // Remove the possible advantage notation right away to prevent parsing errors..
        if (advantage) {
            move = move.substring(0, move.length - 1);
        }

        // 2 disambiguating types are possible. Regular move (eg: Rbc8) or capture (eg: Rbxc8).
        // In both cases the second letter is the file letter.
        const disambiguating = (move.length == 4 && move.charAt(1) != 'x') || move.length == 5 ? move.charAt(1) : '';

        // Remove the possible disambiguating notation.
        if (disambiguating) {
            const startIndex = move.length == 4 ? 2 : 3;
            move = move.substring(startIndex);
        }

        // Remove the rook letter (R) and possibly the x from the regular moves (eg: Rc8, Rxc8).
        if (move.length == 3 || move.length == 4) {
            const startIndex = move.length == 3 ? 1 : 2;
            move = move.substring(startIndex);
        }

        // The four possible directions for a rook.
        const directions = ['forward', 'backward', 'right', 'left'];
        let startingPosition;

        // Get the starting position by testing the moves from each direction.
        for (let i = 0; i < directions.length; i++) {
            // Get the possible moves in the given direction.
            let moves = check.getMoves(move, directions[i], this.#chessboard.getMaxSquares(), true);

            // Test each move.
            for (let j = 0; j < moves.length; j++) {
                if (disambiguating && disambiguating != moves[j].charAt(0)) {
                    continue;
                }

                let square = this.#chessboard.getSquare(moves[j]);

                if (square == 'R' + this.#chessboard.whoseTurnIsIt()) {
                    startingPosition = moves[j];
                }
            }
        }

        // Get the rook object.
        const rook = this.#chessboard.getPieceAtPosition(startingPosition);
        // Move the rook.
        this.#chessboard.movePiece(rook, move);

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
