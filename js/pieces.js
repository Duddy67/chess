
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

        this.#move = new Movable(chessboard, side);
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

}

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

