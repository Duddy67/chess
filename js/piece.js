
class Piece {
    #side;

    constructor(chessboard, side, position) {
        // Make the class abstract.
        if (this.constructor == Piece) {
            throw new Error('Class is of abstract type and can\'t be instantiated');
        }

        this._chessboard = chessboard;
        this.#side = side;
        this._position = position;
    }

    getSide() {
        return this.#side;
    }

    /*
     * Returns the coordinates of a step forward went from the piece position.
     * If a boundary effect is detected, the piece position is returned.
     */
    _getOneStepForward() {
        // Extract rank coordinates from the position.
        let rank = this._position.charAt(1);

        // One step forward from the white viewpoint.
        if (this.#side == 'w') {
            // Check for boundary effect.
            rank = parseInt(rank) < this._chessboard.getMaxSquares() ? parseInt(rank) + 1 : rank;
        }
        // One step forward from the black viewpoint.
        else {
            // Check for boundary effect.
            rank = parseInt(rank) > 1 ? parseInt(rank) - 1 : rank;
        }

        return this._position.charAt(0) + rank;
    }
}

class King extends Piece {
     #type;
     #code;
     #image;

    constructor(chessboard, side, position) {
        super(chessboard, side, position);
        this.#type = 'K';
        this.#code = this.#type + this.getSide();
        this.#image = 'images/' + this.#code;
        //this.code = this.type + side;
        //this.image = 'images/' + code + '.png';
        console.log(this._chessboard);
    }


}
