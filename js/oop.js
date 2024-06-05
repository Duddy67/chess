
class Chess {
        // Used to determine whose turn is it (white or black). Starts with white.
        #side = 'w'; 
        // A 2 dimensional array which stores the piece positions on the chessboard.
        #chessboard = [
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
                               '1': 7, '2': 6, '3': 5, '4': 4, '5': 3, '6': 2, '7': 1, '8': 0}
        // The move object that stores the starting and ending positions of a piece plus extra data regarding the move. 
        #move = {'from': {'rank': '', 'file': ''}, 'to': {'rank': '', 'file': ''}, 'piece': '', 'capture': false};
        #history = [];
        #isPawnPromoted = false;
        // The maximum steps a piece can go on the chessboard.
        #MAX_STEPS = 7;
        // The maximum number of squares a rank, a file or a diagonal can have.
        #MAX_SQUARES = 8;

    constructor(chessboard) {
        this.#chessboard = chessboard !== undefined ? chessboard : this.#chessboard;
    }

    #updateChessboard() {
        const coordinates = this.#coordinates;
        const move = this.#move;
        // Get the piece color (ie: the second letter of the string). 
        const color = this.#chessboard[coordinates[move.from.rank]][coordinates[move.from.file]].slice(1, 2);

        // Update the piece position on the chessboard.
        this.#chessboard[coordinates[move.from.rank]][coordinates[move.from.file]] = '';
        this.#chessboard[coordinates[move.to.rank]][coordinates[move.to.file]] = move.piece + color;
    }

    /*
     * Returns the value of a square (ie: empty or occupied by a piece) at a given position.
     */
    #getSquare(position) {
        const rank = position.charAt(1);
        const file = position.charAt(0);

        return this.#chessboard[this.#coordinates[rank]][this.#coordinates[file]];
    }

    #switchSides() {
        this.#side = this.#side == 'w' ? 'b' : 'w';
    }

    #whoseTurnIsIt() {
        return this.#side;
    }

    #setHistory() {
        const move = this.#move;
        const capture = move.capture === true ? 'x' : '';
        // Store the current move as well as the current state of the chessboard.
        const history = { 
            'move': move.piece + move.from.file + move.from.rank + capture + move.to.file + move.to.rank,
            'chessboard':  this.#chessboard
        };
        
        this.#history.push(history);
    }

    /*
     * Returns the coordinates of a step forward went from a given position.
     * If a boundary effect is detected, the given position is returned.
     */
    #goOneStepForward(position) {
        // Extract rank coordinates from the given position.
        let rank = position.charAt(1);

        // One step forward from the white viewpoint.
        if (this.#side == 'w') {
            // Check for boundary effect.
            rank = parseInt(rank) < this.#MAX_SQUARES ? parseInt(rank) + 1 : rank;
        }
        // One step forward from the black viewpoint.
        else {
            // Check for boundary effect.
            rank = parseInt(rank) > 1 ? parseInt(rank) - 1 : rank;
        }

        return position.charAt(0) + rank;
    }

    /*
     * Returns the coordinates of a step backward went from a given position.
     * If a boundary effect is detected, the given position is returned.
     */
    #goOneStepBackward(position) {
        // Extract rank coordinates from the given position.
        let rank = position.charAt(1);

        // One step backward from the white viewpoint.
        if (this.#side == 'w') {
            // Check for boundary effect.
            rank = parseInt(rank) > 1 ? parseInt(rank) - 1 : rank;
        }
        // One step backward from the black viewpoint.
        else {
            // Check for boundary effect.
            rank = parseInt(rank) < this.#MAX_SQUARES ? parseInt(rank) + 1 : rank;
        }

        return position.charAt(0) + rank;
    }

    /*
     * Returns the coordinates of a step right went from a given position.
     * If a boundary effect is detected, the given position is returned.
     */
    #goOneStepRight(position) {
        // Extract file coordinates from the given position.
        let file = position.charAt(0);

        // One step right from the white viewpoint.
        if (this.#side == 'w') {
            // Check for boundary effect.
            file = file.localeCompare('h') === -1 ? String.fromCharCode(file.charCodeAt(0) + 1) : file;
        }
        // One step right from the black viewpoint.
        else {
            // Check for boundary effect.
            file = file.localeCompare('a') === 1 ? String.fromCharCode(file.charCodeAt(0) - 1) : file;
        }

        return file + position.charAt(1);
    }

    /*
     * Returns the coordinates of a step left went from a given position.
     * If a boundary effect is detected, the given position is returned.
     */
    #goOneStepLeft(position) {
        // Extract file coordinates from the given position.
        let file = position.charAt(0);

        // One step left from the white viewpoint.
        if (this.#side == 'w') {
            // Check for boundary effect.
            file = file.localeCompare('a') === 1 ? String.fromCharCode(file.charCodeAt(0) - 1) : file;
        }
        // One step left from the black viewpoint.
        else {
            // Check for boundary effect.
            file = file.localeCompare('h') === -1 ? String.fromCharCode(file.charCodeAt(0) + 1) : file;
        }

        return file + position.charAt(1);
    }

    /*
     * Returns the coordinates of two steps went from a given position in a given direction.
     * If a boundary effect is detected, the given position is returned.
     * N.B: This function is only used for knight pieces due to their specific moves.
     */
    #goTwoSteps(position, direction) {
        const initialPosition = position;
        const functionName = 'this.#goOneStep' + direction; 

        for (let i = 0; i < 2; i++) {
            let previousPosition = position;
            // N.B: Using eval is not risky here as it's called inside the Chess anonymous 
            //      function scope. Thus, no one can modify the eval argument from the outside.
            position = eval(`${functionName}(position)`);

            if (position == previousPosition) {
                return initialPosition;
            }
        }

        return position;
    }

    /*
     * Returns the possible moves from a given position to a given direction.
     */
    #getMoves(position, steps, direction) {
        // Get the number of steps according to the given 'steps' parameter.
        steps = steps === undefined ? this.#MAX_STEPS : steps;
        let moves = [];
        // Temporary variables needed for diagonals.
        let forward = '';
        let backward = '';

        // Loop through each step.
        for (let i = 0; i < steps; i++) {
            let previousPosition = position;

            // Go one step in the given direction.
            switch (direction) {
                case 'forward':
                    position = this.#goOneStepForward(position);
                    break;

                case 'backward':
                    position = this.#goOneStepBackward(position);
                    break;

                case 'right':
                    position = this.#goOneStepRight(position);
                    break;

                case 'left':
                    position = this.#goOneStepLeft(position);
                    break;

                case 'right-diagonal-forward':
                    // First go one step forward.
                    position = this.#goOneStepForward(position);

                    // Check for boundary effect.
                    if (position == previousPosition) {
                        break
                    }

                    forward = position;

                    // Then go one step right to get the diagonal direction.
                    position = this.#goOneStepRight(position);

                    // Check again for boundary effect.
                    if (position == forward) {
                        position = previousPosition;
                    }

                    break;

                case 'left-diagonal-forward':
                    // First go one step forward.
                    position = this.#goOneStepForward(position);

                    // Check for boundary effect.
                    if (position == previousPosition) {
                        break
                    }

                    forward = position;

                    // Then go one step left to get the diagonal direction.
                    position = this.#goOneStepLeft(position);

                    // Check again for boundary effect.
                    if (position == forward) {
                        position = previousPosition;
                    }

                    break;

                case 'right-diagonal-backward':
                    // First go one step backward.
                    position = this.#goOneStepBackward(position);

                    // Check for boundary effect.
                    if (position == previousPosition) {
                        break
                    }

                    backward = position;

                    // Then go one step right to get the diagonal direction.
                    position = this.#goOneStepRight(position);

                    // Check again for boundary effect.
                    if (position == backward) {
                        position = previousPosition;
                    }

                    break;

                case 'left-diagonal-backward':
                    // First go one step backward.
                    position = this.#goOneStepBackward(position);

                    // Check for boundary effect.
                    if (position == previousPosition) {
                        break
                    }

                    backward = position;

                    // Then go one step left to get the diagonal direction.
                    position = this.#goOneStepLeft(position);

                    // Check again for boundary effect.
                    if (position == backward) {
                        position = previousPosition;
                    }

                    break;
            }

            let square = this.#getSquare(position);

            // The position hasn't changed (ie: boundary effect), or the square is occupied by a friend piece.
            if (position == previousPosition || square.charAt(1) == this.#side) {
                // The piece can't move here.
                break;
            }

            moves.push(position);

            // The square is occupied by an opponent piece (that can possibly be captured). 
            if (square && square.charAt(1) != this.#side) {
                // The piece can't go further.
                break;    
            }
        }

        return moves;
    }

    // Functions that return the possible moves in a specific direction.

    #getForwardMoves(position, steps) {
        return this.#getMoves(position, steps, 'forward');
    }

    #getBackwardMoves(position, steps) {
        return this.#getMoves(position, steps, 'backward');
    }

    #getRightMoves(position, steps) {
        return this.#getMoves(position, steps, 'right');
    }

    #getLeftMoves(position, steps) {
        return this.#getMoves(position, steps, 'left');
    }

    #getRightDiagonalForwardMoves(position, steps) {
        return this.#getMoves(position, steps, 'right-diagonal-forward');
    }

    #getLeftDiagonalForwardMoves(position, steps) {
        return this.#getMoves(position, steps, 'left-diagonal-forward');
    }

    #getRightDiagonalBackwardMoves(position, steps) {
        return this.#getMoves(position, steps, 'right-diagonal-backward');
    }

    #getLeftDiagonalBackwardMoves(position, steps) {
        return this.#getMoves(position, steps, 'left-diagonal-backward');
    }

    // Functions dedicated to the knight specific moves.

    #getKnightForwardMoves(position, direction) {
        const initialPosition = position;
        let moves = [];
        let forwardPosition = this.#goTwoSteps(position, 'Forward');

        // No boundary effect.
        if (forwardPosition != position) {
            const functionName = 'this.#goOneStep' + direction;
            position = eval(`${functionName}(forwardPosition)`);

            // No boundary effect.
            if (position != forwardPosition) {
                moves.push(position);
            }
        }

        forwardPosition = this.#goOneStepForward(initialPosition);

        // No boundary effect.
        if (forwardPosition != initialPosition) {
            position = this.#goTwoSteps(forwardPosition, direction);

            // No boundary effect.
            if (position != forwardPosition) {
                moves.push(position);
            }
        }

        return moves;
    }

    #getKnightBackwardMoves(position, direction) {
        const initialPosition = position;
        let moves = [];
        let backwardPosition = this.#goTwoSteps(position, 'Backward');

        // No boundary effect.
        if (backwardPosition != position) {
            const functionName = 'this.#goOneStep' + direction;
            position = eval(`${functionName}(backwardPosition)`);

            // No boundary effect.
            if (position != backwardPosition) {
                moves.push(position);
            }
        }

        backwardPosition = this.#goOneStepBackward(initialPosition);

        // No boundary effect.
        if (backwardPosition != initialPosition) {
            position = this.#goTwoSteps(backwardPosition, direction);

            // No boundary effect.
            if (position != backwardPosition) {
                moves.push(position);
            }
        }

        return moves;
    }

    getChessboard() {
        return this.#chessboard;
    }

    whoseTurnIsIt() {
        return this.#whoseTurnIsIt();
    }

    // Returns the square value set to a given position. 
    getSquare(position) {
        return this.#getSquare(position);
    }

    // Functions that return the all possible moves for each piece.

    getKingMoves(position) {
        const step = 1;
        let moves = [];

        return moves.concat(this.#getForwardMoves(position, step), 
                            this.#getBackwardMoves(position, step),
                            this.#getRightMoves(position, step),
                            this.#getLeftMoves(position, step),
                            this.#getRightDiagonalForwardMoves(position, step),
                            this.#getLeftDiagonalForwardMoves(position, step),
                            this.#getRightDiagonalBackwardMoves(position, step),
                            this.#getLeftDiagonalBackwardMoves(position, step)
        );
    }

    getQueenMoves(position) {
        let moves = [];

        return moves.concat(this.#getForwardMoves(position), 
                            this.#getBackwardMoves(position),
                            this.#getRightMoves(position),
                            this.#getLeftMoves(position),
                            this.#getRightDiagonalForwardMoves(position),
                            this.#getLeftDiagonalForwardMoves(position),
                            this.#getRightDiagonalBackwardMoves(position),
                            this.#getLeftDiagonalBackwardMoves(position)
        );
    }

    getBishopMoves(position) {
        let moves = [];

        return moves.concat(this.#getRightDiagonalForwardMoves(position),
                            this.#getLeftDiagonalForwardMoves(position),
                            this.#getRightDiagonalBackwardMoves(position),
                            this.#getLeftDiagonalBackwardMoves(position)
        );
    }

    getKnightMoves(position) {
        let moves = [];

        moves = moves.concat(this.#getKnightForwardMoves(position, 'Left'),
                             this.#getKnightForwardMoves(position, 'Right'),
                             this.#getKnightBackwardMoves(position, 'Left'),
                             this.#getKnightBackwardMoves(position, 'Right')
        );

        for (let i = 0; i < moves.length; i++) {
            let square = this.#getSquare(moves[i]);

            // The square is occupied by a friend piece.
            if (square.charAt(1) == this.#side) {
                //console.log(square + moves[i]);
                // The knight can't move here.
                moves.splice(i, 1);
            }
        }

        return moves;
    }

    getRookMoves(position) {
        let moves = [];

        return moves.concat(this.#getForwardMoves(position), 
                            this.#getBackwardMoves(position),
                            this.#getRightMoves(position),
                            this.#getLeftMoves(position)
        );
    }

    getPawnMoves(position) {
        // Check the number of steps allowed (ie: 2 or 1) according to the pawn rank position.
        let steps = (this.#side == 'w' && position.charAt(1) == 2) || (this.#side == 'b' && position.charAt(1) == 7) ? 2 : 1;
        let moves = this.#getForwardMoves(position, steps);

        // Check for any opponent piece in the way.
        for (let i = 0; i < moves.length; i++) {
            // There is an opponent piece.
            if (this.#getSquare(moves[i])) {
                // The pawn can't go there.
                moves.splice(i, 1);
            }
        }

        // Check for possible opponent pieces to capture diagonally.

        const forward = this.#goOneStepForward(position);

        if (forward != position) {
            position = this.#goOneStepRight(forward);

            if (position != forward && this.#getSquare(position)) {
                moves.push(position);
            }

            position = this.#goOneStepLeft(forward);

            if (position != forward && this.#getSquare(position)) {
                moves.push(position);
            }
        }

        // Check for pawn promotion.
        if (moves.length) {
            moves.forEach((move) => {
                // A white pawn can move up somewhere to the 8th rank.
                if (this.#side == 'w' && /[a-h]8/.test(move)) {
                    this.#isPawnPromoted = true;
                }

                // A black pawn can move down somewhere to the first rank.
                if (this.#side == 'b' && /[a-h]1/.test(move)) {
                    this.#isPawnPromoted = true;
                }
            });
        }

        // TODO Check for the "en passant" move.

        return moves;
    }

    /*setMove(move) {

        // The UCI protocol doesn't use any abbreviation for pawns.
        if (!/^[A-Z]/.test(move)) {
            move = 'P' + move;
        }

        this.#move.piece = move.charAt(0);
        this.#move.from.file = move.slice(1, 2);
        this.#move.from.rank = move.slice(2, 3);
        this.#move.capture = move.slice(3, 4) == 'x' ? true : false;
        this.#move.to.file = this.#move.capture ? move.slice(4, 5) : move.slice(3, 4);
        this.#move.to.rank = this.#move.capture ? move.slice(5, 6) : move.slice(4, 5);

        //#updateChessboard();
    }*/

    setMoveFrom(from, piece) {
        this.#move.piece = piece;
        this.#move.from.file = from.charAt(0);
        this.#move.from.rank = from.charAt(1);
    }

    /*
     * Empties the move object.
     */
    resetMove() {
        this.#move.piece = '';
        this.#move.from.file = '';
        this.#move.from.rank = '';
        this.#move.capture = false;
        this.#move.to.file = '';
        this.#move.to.rank = '';
        // 
        this.#isPawnPromoted = false;
    }

    getMoveFrom() {
        return this.#move.from.file ? {'file': this.#move.from.file, 'rank': this.#move.from.rank} : {};
    }

    playMove(moveTo, newPiece) {
        this.#move.to.file = moveTo.charAt(0);
        this.#move.to.rank = moveTo.charAt(1);

        if (this.#getSquare(moveTo.charAt(0) + moveTo.charAt(1))) {
            this.#move.capture = true;
        }

        // Check for promoted pawn.
        if (newPiece !== undefined) {
            // Replace the promoted pawn by the selected piece.
            this.#move.piece = newPiece;
        }

        this.#updateChessboard();

        this.#setHistory();
        this.resetMove();

        this.#switchSides();
    }

    updateChessboard() {
        const coordinates = this.#coordinates;
        const move = this.#move;
        // Get the piece color (ie: the second letter of the string). 
        const color = this.#chessboard[coordinates[move.from.rank]][coordinates[move.from.file]].slice(1, 2);

        // Update the piece position on the chessboard.
        this.#chessboard[coordinates[move.from.rank]][coordinates[move.from.file]] = '';
        this.#chessboard[coordinates[move.to.rank]][coordinates[move.to.file]] = move.piece + color;
    }

    isPawnPromoted() {
       return this.#isPawnPromoted;
    }

    getHistory() {
       return this.#history;
    }

    isObjectEmpty(value) {
        return value && Object.keys(value).length === 0;
    }

    isObjectNotEmpty(value) {
        return value && Object.keys(value).length !== 0;
    }

}
