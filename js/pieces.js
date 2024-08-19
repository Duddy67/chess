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
        // The array length has to be equal to the number of steps. If not so, return the initial position.
        // Otherwise, return the last element (ie: position) of the array.
        return newPosition.length && newPosition.length == steps ? newPosition[newPosition.length - 1] : fromPosition;
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
}

// Children classes that create the chess pieces and their specificities.

class King extends Piece {
    #moved;

    constructor(chessboard, side, position) {
        super(chessboard, side, 'K', position);
        this.#moved = false;
    }

    hasMoved() {
        return this.#moved;
    }

    /*
     * Once moved, the king can't castling no more.
     */
    moved() {
        this.#moved = true;
    }

    unmoved() {
        this.#moved = false;
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
        const skip = true;
        const straightDirections = ['Forward', 'Backward', 'Right', 'Left'];
        const straightAttackers = ['Q', 'R'];
        const diagonalDirections = ['RightDiagonalForward', 'RightDiagonalBackward', 'LeftDiagonalForward', 'LeftDiagonalBackward'];
        const diagonalAttackers = ['Q', 'B', 'P'];

        // Check for straight attacks.
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

        // Check for diagonal attacks.
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

        // Check for knight attacks.

        const lftRgt = [['left', 'right'], ['left', 'right']];
        const fwdBwd = ['forward', 'backward'];
        // Compute the side of the opponent knight.
        const knight = this.getSide() == 'w' ? 'Nb' : 'Nw';
        let knightPositions = [];

        // Get the possible knight positions.
        for (let i = 0; i < lftRgt.length; i++) {
            for (let j = 0; j < lftRgt[i].length; j++) {
                // First move: Go 2 steps forward or backward skipping over the possible pieces in the way.
                let tmpPosition = this.getNewPosition(this.getPosition(), fwdBwd[i], 2, skip);

                // Check for boundary effect.
                if (tmpPosition != this.getPosition()) {
                    // Then from there, go 1 step to the left or to the right. 
                    // N.B: No need to skip over possible pieces in the way as it's the destination square.
                    let position = this.getNewPosition(tmpPosition, lftRgt[i][j], 1);

                    // No boundary effect.
                    if (position != tmpPosition) {
                        knightPositions.push(position);
                    }
                }

                // Second move: now go 1 step forward or backward skipping over the possible pieces in the way.
                tmpPosition = this.getNewPosition(this.getPosition(), fwdBwd[i], 1, skip);

                // No boundary effect.
                if (tmpPosition != this.getPosition()) {
                    // Then from there, go 1 step to the left or to the right. 
                    let position = this.getNewPosition(tmpPosition, lftRgt[i][j], 2, skip);

                    // No boundary effect.
                    if (position != tmpPosition) {
                        knightPositions.push(position);
                    }
                }
            }
        }

        // Check for possible opponent knight.
        for (let i = 0; i < knightPositions.length; i++) {
            if (this.getChessboard().getSquare(knightPositions[i]) && this.getChessboard().getSquare(knightPositions[i]) == knight) {
                return true;
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
    #moved;

    constructor(chessboard, side, position) {
        super(chessboard, side, 'R', position);
        this.#moved = false;
    }

    hasMoved() {
        return this.#moved;
    }

    /*
     * Once moved, the king can't castling no more.
     */
    moved() {
        this.#moved = true;
    }

    unmoved() {
        this.#moved = false;
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
    #lftRgt = [['left', 'right'], ['left', 'right']];
    #fwdBwd = ['forward', 'backward'];

    constructor(chessboard, side, position) {
        super(chessboard, side, 'N', position);
    }

    getMoves() {
        let moves = [];
        const skip = true;

        for (let i = 0; i < this.#lftRgt.length; i++) {
            for (let j = 0; j < this.#lftRgt[i].length; j++) {
                // First move: Go 2 steps forward or backward skipping over the possible pieces in the way.
                let tmpPosition = this.getNewPosition(this.getPosition(), this.#fwdBwd[i], 2, skip);

                // Check for boundary effect.
                if (tmpPosition != this.getPosition()) {
                    // Then from there, go 1 step to the left or to the right. 
                    // N.B: No need to skip over possible pieces in the way as it's the destination square.
                    let position = this.getNewPosition(tmpPosition, this.#lftRgt[i][j], 1);

                    // No boundary effect.
                    if (position != tmpPosition) {
                        moves.push(position);
                    }
                }

                // Second move: now go 1 step forward or backward skipping over the possible pieces in the way.
                tmpPosition = this.getNewPosition(this.getPosition(), this.#fwdBwd[i], 1, skip);

                // No boundary effect.
                if (tmpPosition != this.getPosition()) {
                    // Then from there, go 2 step to the left or to the right. 
                    let position = this.getNewPosition(tmpPosition, this.#lftRgt[i][j], 2, skip);

                    // No boundary effect.
                    if (position != tmpPosition) {
                        moves.push(position);
                    }
                }
            }
        }

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

    #enPassant() {
        const chessboard = this.getChessboard();
        let enPassant = '';

        if (chessboard.getHistory().length) {
            // Get the latest move of the opponent side.
            const history = chessboard.getHistory()[chessboard.getHistory().length - 1];
            // Compute the rank numbers that match a 2 step move of an opponent pawn.
            const fromRank = history.pieceCode.charAt(1) == 'w' ? 2 : 7;
            const toRank = history.pieceCode.charAt(1) == 'w' ? 4 : 5;

            // Check the latest piece played is a pawn that moved 2 steps forward.
            if (history.pieceCode.charAt(0) == 'P' && history.from.charAt(1) == fromRank && history.to.charAt(1) == toRank) {
                // Now verify if our pawn currently stands on the left or right side of the opponent pawn.
                if (this.#stepable.goOneStepRight(history.to) == this.getPosition() || this.#stepable.goOneStepLeft(history.to) == this.getPosition()) {
                    // Get the rank number just behind the opponent pawn.  
                    const backRank = history.pieceCode.charAt(1) == 'w' ? 3 : 6;
                    // Set the en passant square code.
                    enPassant = history.to.charAt(0) + backRank;
                }
            }
        }

        return enPassant;
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

        // Check for the "en passant" move.
        const enPassant = this.#enPassant();

        if (enPassant) {
            moves.push(enPassant);
        }

        return moves;
    }

    isPromoted() {
        return this.#promoted;
    }
}

