
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
    #index;
    #image;

    constructor(chessboard, side, type, position, index) {
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
        this.#index = index === undefined ? chessboard.getPieces().length : index;
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

    getIndex() {
        return this.#index;
    }

    getImage() {
        return this.#image;
    }

    /*
     * Returns the position gotten from an initial position after a given number
     * of steps in a given direction.  
     */
    getNewPosition(fromPosition, direction, steps, skip) {
        let newPosition = this.#move.getMoves(fromPosition, direction, steps, skip);

        // An empty array means boundary effect. If so, return the initial position.
        // Otherwise, return the last element (ie: position) of the array.
        return newPosition.length ? newPosition[newPosition.length - 1] : fromPosition;
    }

    // Methods that return the ending position after a given number of steps on the board in a specific direction. 

    getForwardMoves(steps, skip) {
        return this.#move.getMoves(this.#position, 'forward', steps, skip);
    }

    getBackwardMoves(steps, skip) {
        return this.#move.getMoves(this.#position, 'backward', steps, skip);
    }

    getRightMoves(steps, skip) {
        return this.#move.getMoves(this.#position, 'right', steps, skip);
    }

    getLeftMoves(steps, skip) {
        return this.#move.getMoves(this.#position, 'left', steps, skip);
    }

    getRightDiagonalForwardMoves(steps, skip) {
        return this.#move.getMoves(this.#position, 'right-diagonal-forward', steps, skip);
    }

    getLeftDiagonalForwardMoves(steps, skip) {
        return this.#move.getMoves(this.#position, 'left-diagonal-forward', steps, skip);
    }

    getRightDiagonalBackwardMoves(steps, skip) {
        return this.#move.getMoves(this.#position, 'right-diagonal-backward', steps, skip);
    }

    getLeftDiagonalBackwardMoves(steps, skip) {
        return this.#move.getMoves(this.#position, 'left-diagonal-backward', steps, skip);
    }

    setPosition(position) {
        this.#position = position;
    }

    /*
     * Computes the position of a step made from a given position to a given direction.
     */
    getOneStepFurtherPosition(position, direction) {
        if (this.#side == 'w' && direction == 'forward' && parseInt(position.charAt(1)) < 8) {
            const rank = parseInt(position.charAt(1)) + 1;
            position = position.charAt(0) + rank;
        }
        else if (this.#side == 'b' && direction == 'forward' && parseInt(position.charAt(1)) > 1) {
            const rank = parseInt(position.charAt(1)) - 1;
            position = position.charAt(0) + rank;
        }
        else if (this.#side == 'w' && direction == 'backward' && parseInt(position.charAt(1)) > 1) {
            const rank = parseInt(position.charAt(1)) - 1;
            position = position.charAt(0) + rank;
        }
        else if (this.#side == 'b' && direction == 'backward' && parseInt(position.charAt(1)) < 8) {
            const rank = parseInt(position.charAt(1)) + 1;
            position = position.charAt(0) + rank;
        }
        else if (this.#side == 'w' && direction == 'right' && position.charAt(0) < 'h') {
            let file = position.charAt(0);
            file = String.fromCharCode(file.charCodeAt(0) + 1);
            position = file + position.charAt(1);
        }
        else if (this.#side == 'b' && direction == 'right' && position.charAt(0) > 'a') {
            let file = position.charAt(0);
            file = String.fromCharCode(file.charCodeAt(0) - 1);
            position = file + position.charAt(1);
        }
        else if (this.#side == 'w' && direction == 'left' && position.charAt(0) > 'a') {
            let file = position.charAt(0);
            file = String.fromCharCode(file.charCodeAt(0) - 1);
            position = file + position.charAt(1);
        }
        else if (this.#side == 'b' && direction == 'left' && position.charAt(0) < 'h') {
            let file = position.charAt(0);
            file = String.fromCharCode(file.charCodeAt(0) + 1);
            position = file + position.charAt(1);
        }

        return position;
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
        const steps = 1;
        const skip = true;
        const straightDirections = ['Forward', 'Backward', 'Right', 'Left'];
        const diagonalDirections = ['RightDiagonalForward', 'RightDiagonalBackward', 'LeftDiagonalForward', 'LeftDiagonalBackward'];
        const straightAttackers = ['Q', 'R'];
        const diagonalAttackers = ['Q', 'B', 'P'];
        const knight = this.getSide() == 'w' ? 'Nb' : 'Nw';

        for (let i = 0; i < straightDirections.length; i++) {
            let functionName = 'get' + straightDirections[i] + 'Moves';
            course = this[functionName]();

            // Check whether an opponent piece stands at the end of the course (ie: the last square).
            if (course.length && course[course.length - 1] && this.getChessboard().getSquare(course[course.length - 1])) {
                // Get the piece type.
                attacker = this.getChessboard().getSquare(course[course.length - 1]).charAt(0);
                // The king is attacked by the opponent piece.
                if (straightAttackers.includes(attacker)) {
                    return true;
                }
            }
        }

        for (let i = 0; i < diagonalDirections.length; i++) {
            let functionName = 'get' + diagonalDirections[i] + 'Moves';
            course = this[functionName]();

            // Check whether an opponent piece stands at the end of the course (ie: the last square).
            if (course.length && course[course.length - 1] && this.getChessboard().getSquare(course[course.length - 1])) {
                // Get the piece type.
                attacker = this.getChessboard().getSquare(course[course.length - 1]).charAt(0);
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
        }

        // Check whether the king is attacked by a knight.
        for (let i = 0; i < diagonalDirections.length; i++) {
            // First, go one step diagonally.
            let functionName = 'get' + diagonalDirections[i] + 'Moves';
            course = this[functionName](steps, skip);
            let position;

            if (course.length && (functionName == 'getRightDiagonalForwardMoves' || functionName == 'getLeftDiagonalForwardMoves')) {
                // Then go one step forward.
                position = this.getOneStepFurtherPosition(course[0], 'forward');
                

console.log('forward ' + course + ' ' + position);
                // Check whether a knight stands on the end of the course.
                if (position != course[0] && this.getChessboard().getSquare(position) && this.getChessboard().getSquare(position) == knight) {
                    return true;
                }

                // Check the right or left square according to the previous step.
                position = functionName == 'getRightDiagonalForwardMoves' ? this.getOneStepFurtherPosition(course[0], 'right') : this.getOneStepFurtherPosition(course[0], 'left');

console.log('left / right ' + course + ' ' + position);
                // Check whether a knight stands on the end of the course.
                if (position != course[0] && this.getChessboard().getSquare(position) && this.getChessboard().getSquare(position) == knight) {
                    return true;
                }
            }

            if (course.length && (functionName == 'getRightDiagonalBackwardMoves' || functionName == 'getLeftDiagonalBackwardMoves')) {
                // Then go one step backward.
                position = this.getOneStepFurtherPosition(course[0], 'backward');

                // Check whether a knight stands on the end of the course.
                if (position != course[0] && this.getChessboard().getSquare(position) && this.getChessboard().getSquare(position) == knight) {
                    return true;
                }

                // Check the right or left square according to the previous step.
                position = functionName == 'getRightDiagonalForwardMoves' ? this.getOneStepFurtherPosition(course[0], 'right') : this.getOneStepFurtherPosition(course[0], 'left');

                // Check whether a knight stands on the end of the course.
                if (position != course[0] && this.getChessboard().getSquare(position) && this.getChessboard().getSquare(position) == knight) {
                    return true;
                }
            }
        }

        return false;
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

    constructor(chessboard, side, position) {
        super(chessboard, side, 'N', position);
    }

    // Overwritten functions to fit the knight specific moves.

    /*
     * Computes the 2 possible moves of a knight when it's moved forward.
     */
    #getForwardMoves(position, direction) {
        const initialPosition = position;
        let moves = [];
        const skip = true;

        // First move: Go 2 steps forward skipping over the possible pieces in the way.
        let forwardPosition = this.getNewPosition(position, 'forward', 2, skip);

        // Check for boundary effect.
        if (forwardPosition != position) {
            // Then from there, go 1 step to the given direction (ie: left or right). 
            // N.B: No need to skip over possible pieces in the way as it's the destination square.
            position = this.getNewPosition(forwardPosition, direction, 1);

            // No boundary effect.
            if (position != forwardPosition) {
                moves.push(position);
            }
        }

        // Second move: now go 1 step forward skipping over the possible pieces in the way.
        forwardPosition = this.getNewPosition(initialPosition, 'forward', 1, skip);

        // No boundary effect.
        if (forwardPosition != initialPosition) {
            // Then from there, go 2 steps to the given direction (ie: left or right)
            position = this.getNewPosition(forwardPosition, direction, 2, skip);

            // No boundary effect.
            if (position != forwardPosition) {
                moves.push(position);
            }
        }

        return moves;
    }

    /*
     * Computes the 2 possible moves of a knight when it's moved backward.
     */
    #getBackwardMoves(position, direction) {
        const initialPosition = position;
        let moves = [];
        const skip = true;

        let backwardPosition = this.getNewPosition(position, 'backward', 2, skip);

        // No boundary effect.
        if (backwardPosition != position) {
            position = this.getNewPosition(backwardPosition, direction, 1);

            // No boundary effect.
            if (position != backwardPosition) {
                moves.push(position);
            }
        }

        backwardPosition = this.getNewPosition(initialPosition, 'backward', 1, skip);

        // No boundary effect.
        if (backwardPosition != initialPosition) {
            position = this.getNewPosition(backwardPosition, direction, 2, skip);

            // No boundary effect.
            if (position != backwardPosition) {
                moves.push(position);
            }
        }

        return moves;
    }

    getMoves() {
        let moves = [];

        moves = moves.concat(this.#getForwardMoves(this.getPosition(), 'left'),
                             this.#getForwardMoves(this.getPosition(), 'right'),
                             this.#getBackwardMoves(this.getPosition(), 'left'),
                             this.#getBackwardMoves(this.getPosition(), 'right')
        );

        // Check for possible friend pieces standing on the destination square.
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

