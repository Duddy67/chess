
/*
 * Super class that contains the attributes and methods common to all chess pieces.
 */
class Piece {
    #chessboard;
    #side;
    #move;
    #position;
    #type;
    #code;
    #image;

    constructor(chessboard, side, type, position) {
        // Make the class abstract.
        if (this.constructor == Piece) {
            throw new Error('Class is of abstract type and can\'t be instantiated');
        }

        this.#move = movable(chessboard, side);
        this.#chessboard = chessboard;
        this.#side = side;
        this.#position = position;
        this.#type = type;
        this.#code = this.#type + this.#side;
        this.#image = 'images/' + this.#code + '.png';
    }

    getChessboard() {
        return this.#chessboard;
    }

    getType() {
        return this.#type;
    }

    getSide() {
        return this.#side;
    }

    getPosition() {
        return this.#position;
    }

    getCode() {
        return this.#code;
    }

    getImage() {
        return this.#image;
    }

    // Methods that return the ending position after a given number of steps on the board in a specific direction. 

    getForwardMoves(steps) {
        return this.#move.getMoves(this.#position, steps, 'forward');
    }

    getBackwardMoves(steps) {
        return this.#move.getMoves(this.#position, steps, 'backward');
    }

    getRightMoves(steps) {
        return this.#move.getMoves(this.#position, steps, 'right');
    }

    getLeftMoves(steps) {
        return this.#move.getMoves(this.#position, steps, 'left');
    }

    getRightDiagonalForwardMoves(steps) {
        return this.#move.getMoves(this.#position, steps, 'right-diagonal-forward');
    }

    getLeftDiagonalForwardMoves(steps) {
        return this.#move.getMoves(this.#position, steps, 'left-diagonal-forward');
    }

    getRightDiagonalBackwardMoves(steps) {
        return this.#move.getMoves(this.#position, steps, 'right-diagonal-backward');
    }

    getLeftDiagonalBackwardMoves(steps) {
        return this.#move.getMoves(this.#position, steps, 'left-diagonal-backward');
    }

    setPosition(position) {
        this.#position = position;
    }
}

// Children classes that create the chess pieces and their specificities.

class King extends Piece {

    constructor(chessboard, side, position) {
        super(chessboard, side, 'K', position);
    }

    getMoves() {
        const steps = 1;
        let moves = [];

        return moves.concat(this.getForwardMoves(steps),
                            this.getBackwardMoves(steps),
                            this.getRightMoves(steps),
                            this.getLeftMoves(steps),
                            this.getRightDiagonalForwardMoves(steps),
                            this.getLeftDiagonalForwardMoves(steps),
                            this.getRightDiagonalBackwardMoves(steps),
                            this.getLeftDiagonalBackwardMoves(steps)
        );
    }

    isAttacked() {
        let course = [];
        let attacker = '';
        const straightDirections = ['Forward', 'Backward', 'Right', 'Left'];
        const diagonalDirections = ['RightDiagonalForward', 'RightDiagonalBackward', 'LeftDiagonalForward', 'LeftDiagonalBackward'];
        const straightAttackers = ['Q', 'R'];
        const diagonalAttackers = ['Q', 'B', 'P'];

        straightDirections.forEach((direction) => {
            let functionName = 'get' + direction + 'Moves';
            course = this[functionName]();

            // Check whether an opponent piece stands at the end of the course.
            if (course.length && course[course.length - 1]) {
                // Get the piece type.
                attacker = course[course.length - 1].charAt(0);
                // The king is attacked by the opponent piece.
                if (straightAttackers.includes(attacker)) {
                    return true;
                }
            }
        });

        diagonalDirections.forEach((direction) => {
            let functionName = 'get' + direction + 'Moves';
            course = this[functionName]();

            // Check whether an opponent piece stands at the end of the course.
            if (course.length && course[course.length - 1]) {
                // Get the piece type.
                attacker = course[course.length - 1].charAt(0);
                // The king is attacked by the opponent piece.
                if (diagonalAttackers.includes(attacker)) {
                    if (attacker != 'P') {
                        return true;
                    }
                    // A pawn can capture a piece only if the piece stands on the next square diagonally.
                    else if (course.length == 1) {
                        return true;
                    }
                }
            }
        });
    }
}

class Queen extends Piece {

    constructor(chessboard, side, position) {
        super(chessboard, side, 'Q', position);
    }

    getMoves() {
        let moves = [];

        return moves.concat(this.getForwardMoves(),
                            this.getBackwardMoves(),
                            this.getRightMoves(),
                            this.getLeftMoves(),
                            this.getRightDiagonalForwardMoves(),
                            this.getLeftDiagonalForwardMoves(),
                            this.getRightDiagonalBackwardMoves(),
                            this.getLeftDiagonalBackwardMoves()
        );
    }
}

class Rook extends Piece {

    constructor(chessboard, side, position) {
        super(chessboard, side, 'R', position);
    }

    getMoves() {
        let moves = [];

        return moves.concat(this.getForwardMoves(),
                            this.getBackwardMoves(),
                            this.getRightMoves(),
                            this.getLeftMoves()
        );
    }
}

class Bishop extends Piece {

    constructor(chessboard, side, position) {
        super(chessboard, side, 'B', position);
    }

    getMoves() {
        let moves = [];

        return moves.concat(this.getRightDiagonalForwardMoves(),
                            this.getLeftDiagonalForwardMoves(),
                            this.getRightDiagonalBackwardMoves(),
                            this.getLeftDiagonalBackwardMoves()
        );
    }
}

class Knight extends Piece {
    #stepable;

    constructor(chessboard, side, position) {
        super(chessboard, side, 'N', position);
        this.#stepable = stepable(chessboard, side);
    }

    /*
     * Returns the coordinates of two steps went from a given position in a given direction.
     * If a boundary effect is detected, the given position is returned.
     * N.B: This function is only used for knight pieces due to their specific moves.
     */
    #goTwoSteps(position, direction) {
        const initialPosition = position;
        const functionName = 'this.#stepable.goOneStep' + direction;

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

    // Overwritten functions to fit the knight specific moves.

    #getForwardMoves(position, direction) {
        const initialPosition = position;
        let moves = [];
        let forwardPosition = this.#goTwoSteps(position, 'Forward');

        // No boundary effect.
        if (forwardPosition != position) {
            const functionName = 'this.#stepable.goOneStep' + direction;
            position = eval(`${functionName}(forwardPosition)`);

            // No boundary effect.
            if (position != forwardPosition) {
                moves.push(position);
            }
        }

        forwardPosition = this.#stepable.goOneStepForward(initialPosition);

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

    #getBackwardMoves(position, direction) {
        const initialPosition = position;
        let moves = [];
        let backwardPosition = this.#goTwoSteps(position, 'Backward');

        // No boundary effect.
        if (backwardPosition != position) {
            const functionName = 'this.#stepable.goOneStep' + direction;
            position = eval(`${functionName}(backwardPosition)`);

            // No boundary effect.
            if (position != backwardPosition) {
                moves.push(position);
            }
        }

        backwardPosition = this.#stepable.goOneStepBackward(initialPosition);

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

    getMoves() {
        let moves = [];

        moves = moves.concat(this.#getForwardMoves(this.getPosition(), 'Left'),
                             this.#getForwardMoves(this.getPosition(), 'Right'),
                             this.#getBackwardMoves(this.getPosition(), 'Left'),
                             this.#getBackwardMoves(this.getPosition(), 'Right')
        );

        for (let i = 0; i < moves.length; i++) {
            let square = this.getChessboard().getSquare(moves[i]);

            // The square is occupied by a friend piece.
            if (square.charAt(1) == this.getSide()) {
                // The knight can't move here.
                moves.splice(i, 1);
            }
        }

        return moves;
    }
}

class Pawn extends Piece {
    #stepable;
    #promoted;

    constructor(chessboard, side, position) {
        super(chessboard, side, 'P', position);
        this.#stepable = stepable(chessboard, side);
        this.#promoted = false;
    }

    getMoves() {
        // Check the number of steps allowed (ie: 2 or 1) according to the pawn rank position.
        let steps = (this.getSide() == 'w' && this.getPosition().charAt(1) == 2) || (this.getSide() == 'b' && this.getPosition().charAt(1) == 7) ? 2 : 1;
        let moves = this.getForwardMoves(steps);
        const chessboard = this.getChessboard();

        // Check for any opponent piece in the way.
        for (let i = 0; i < moves.length; i++) {
            // There is an opponent piece.
            if (chessboard.getSquare(moves[i])) {
                // The pawn can't go there.
                moves.splice(i, 1);
            }
        }

        // Check for possible opponent pieces to capture diagonally.

        let position = this.getPosition();

        const forward = this.#stepable.goOneStepForward(position);

        if (forward != position) {
            position = this.#stepable.goOneStepRight(forward);

            if (position != forward && chessboard.getSquare(position)) {
                moves.push(position);
            }

            position = this.#stepable.goOneStepLeft(forward);

            if (position != forward && chessboard.getSquare(position)) {
                moves.push(position);
            }
        }

        // Check for pawn promotion.
        if (moves.length) {
            moves.forEach((move) => {
                // A white pawn can move up somewhere to the 8th rank.
                if (this.getSide() == 'w' && /[a-h]8/.test(move)) {
                    this.#promoted = true;
                }

                // A black pawn can move down somewhere to the first rank.
                if (this.getSide() == 'b' && /[a-h]1/.test(move)) {
                    this.#promoted = true;
                }
            });
        }

        // TODO Check for the "en passant" move.

        return moves;
    }

    isPromoted() {
        return this.#promoted;
    }
}

