
class Chessboard {
    // The board as a 2 dimensional array, with the pieces at their initial position.
    #board = [ 
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
                    '1': 7, '2': 6, '3': 5, '4': 4, '5': 3, '6': 2, '7': 1, '8': 0};

    // Used to determine whose turn is it (white or black). Starts with white.
    #side = 'w';

    // The maximum steps a piece can go on the chessboard.
    #MAX_STEPS = 7;

    // The maximum number of squares a rank, a file or a diagonal can have.
    #MAX_SQUARES = 8;

    // The pieces on the board.
    #pieces = [];

    #history = [];

    #castlingSquares = ['c1', 'g1', 'c8', 'g8'];

    constructor(board) {
        this.#board = board !== undefined ? board : this.#board;
        this.#setPieces();
    }

    /*
     * Creates a piece object for each piece present on the board.
     */
    #setPieces() {
        // File and rank values to set piece positions.
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

        // Loop through the 2 dimensional board array.
        for (let i = 0; i < this.#board.length; i++) {
            for (let j = 0; j < this.#board[i].length; j++) {
                // A piece is on the square.
                if (this.#board[i][j]) {
                    const type = this.#board[i][j].charAt(0);
                    const side = this.#board[i][j].charAt(1);
                    const position = files[j] + ranks[i];
                    let piece = this.#createPiece(type, side, position);
                    this.#pieces.push(piece);
                }
            }
        }
    }

    /*
     * Creates a piece corresponding to the given type and side.
     */
    #createPiece(type, side, position, index) {
        let piece = null;

        switch (type) {
            case 'K':
                piece = new King(this, side, position, index);
                break;

            case 'Q':
                piece = new Queen(this, side, position, index);
                break;

            case 'R':
                piece = new Rook(this, side, position, index);
                break;

            case 'B':
                piece = new Bishop(this, side, position, index);
                break;

            case 'N':
                piece = new Knight(this, side, position, index);
                break;

            case 'P':
                piece = new Pawn(this, side, position, index);
                break;
        }

        return piece;
    }

    /*
     * Gets the move data together.
     */
    #getMove(pieceCode, from, to, actions) {
        let move = pieceCode.charAt(0) + to;

        // Check for possible castling.
        if (actions.length && actions[0].startsWith('O-O')){
            move = actions[0];
        }

        const data = {
            pieceCode: pieceCode,
            from: from,
            to: to,
            move: move,
            actions: actions,
            board: this.#board
        }

        return data;
    }

    /*
     * Creates and sends the move event.
     */
    #sendMoveEvent(data) {
        const event = new CustomEvent('move', {
            detail: {
                data: data
            }
        });

        document.dispatchEvent(event);
    }

    /*
     * Reset the pieces and the board to their previous state.
     */
    #stepBack(data) {
        // Move the piece back to its starting position.
        data.piece.setPosition(data.from);

        if (data.capturedPiece) {
           // Bring the captured piece back on the board.
           data.capturedPiece.setPosition(data.to);
        }

        if (data.newPiece) {
            // Switch back into the promoted pawn.
            this.#pieces.splice(data.piece.getIndex(), 1, data.piece);
        }

        // Set the board to its previous state.
        this.#board[this.#coordinates[data.from.charAt(1)]][this.#coordinates[data.from.charAt(0)]] = data.piece.getCode();
        this.#board[this.#coordinates[data.to.charAt(1)]][this.#coordinates[data.to.charAt(0)]] = data.capturedPiece ? data.capturedPiece.getCode() : '';
    }

    /*
     * Returns the rook positions before and after the castling.
     */
    getCastlingRookPositions(king, position) {
        const rankNumber = king.getSide() == 'w' ? 1 : 8;
        // Get the current rook position.
        const rookPositions = {from: '', to: ''};
        rookPositions.from = position.charAt(0) == 'g' ? 'h' + rankNumber : 'a' + rankNumber;
        // Get rook position after castling.
        rookPositions.to = position.charAt(0) == 'g' ? 'f' + rankNumber : 'd' + rankNumber;

        return rookPositions;
    }

    getPieces() {
        return this.#pieces;
    }

    switchSides() {
        this.#side = this.#side == 'w' ? 'b' : 'w';
    }

    whoseTurnIsIt() {
        return this.#side;
    }

    /*
     * Returns the value of a square (ie: empty or occupied by a piece) at a given position.
     */
    getSquare(position) {
        const rank = position.charAt(1);
        const file = position.charAt(0);

        return this.#board[this.#coordinates[rank]][this.#coordinates[file]];
    }

    getBoard() {
        return this.#board;
    }

    getMaxSteps() {
        return this.#MAX_STEPS;
    }

    getMaxSquares() {
        return this.#MAX_SQUARES;
    }

    getHistory() {
        return this.#history;
    }

    getCastlingSquares() {
        return this.#castlingSquares;
    }

    /*
     * Moves a given piece to a given position.
     */
    movePiece(piece, position, newPiece) {
        let actions = [];

        // Collect data in case of step back.
        let data = {
            'piece': piece,
            'from': piece.getPosition(),
            'to': position,
            'newPiece': newPiece === undefined ? null : newPiece,
        };

        // A piece is captured.
        if (this.getSquare(position)) {
            // Set the captured piece to the xx position.
            const capturedPiece = this.getPieceAtPosition(position);
            capturedPiece.setPosition('xx');
            data.capturedPiece = capturedPiece;
            actions.push('x');
        }

        // Get the starting position.
        const from = piece.getPosition();
        let code = piece.getCode();

        // Check for promoted pawn.
        if (newPiece !== undefined) {
            code = newPiece;
            const type = newPiece.charAt(0);
            const side = newPiece.charAt(1);

            // Replace the promoted pawn by the selected new piece.
            this.#pieces.splice(piece.getIndex(), 1, this.#createPiece(type, side, position, piece.getIndex()));
            actions.push(position + type);
        }
        // King is castling.
        else if (piece.getType() == 'K' && !piece.hasMoved() && this.#castlingSquares.includes(position)) {
            const rookPositions = this.getCastlingRookPositions(piece, position);

            // King castling.
            piece.setPosition(position);
            // Get the castling rook.
            const rook = this.getPieceAtPosition(rookPositions.from);
            // Rook castling.
            rook.setPosition(rookPositions.to);
            rook.moved();

            // Update the castling rook on the chessboard.
            this.#board[this.#coordinates[rookPositions.from.charAt(1)]][this.#coordinates[rookPositions.from.charAt(0)]] = '';
            this.#board[this.#coordinates[rookPositions.to.charAt(1)]][this.#coordinates[rookPositions.to.charAt(0)]] = 'R' + piece.getSide();

            const action = position == 'g1' || position == 'g8' ? 'O-O' : 'O-O-O'; 
            actions.push(action);
        }
        // En passant
        else if (piece.getType() == 'P' && position.charAt(0) != piece.getPosition().charAt(0) && !this.getSquare(position)) {
            // Compute the opponent pawn position, which is on the left or right side of the pawn.  
            const opponentPawnPosition = position.charAt(0) + piece.getPosition().charAt(1);
            const opponentPawn = this.getPieceAtPosition(opponentPawnPosition);
            opponentPawn.setPosition('xx');
            data.capturedPiece = opponentPawn;
            actions.push('enPassant');
            //
            this.#board[this.#coordinates[opponentPawnPosition.charAt(1)]][this.#coordinates[opponentPawnPosition.charAt(0)]] = '';
        }
        else {
            // Set the piece's new position.
            piece.setPosition(position);
        }

        // Update the piece position on the chessboard.
        this.#board[this.#coordinates[from.charAt(1)]][this.#coordinates[from.charAt(0)]] = '';
        this.#board[this.#coordinates[position.charAt(1)]][this.#coordinates[position.charAt(0)]] = code;

        // The move can't be played as the king of the side that is playing is (still) under attack.
        if (this.isKingAttacked()) {
          //console.log('King ' + this.whoseTurnIsIt() + ' is attacked');
          this.#stepBack(data);

          return false;
        }

        if ((piece.getType() == 'K' || piece.getType() == 'R') && !piece.hasMoved()) {
            // The king or rook can no longer castling.
            piece.moved();
        }

        this.switchSides();

        const move = this.#getMove(code, from, position, actions);
        this.#history.push(move);

        this.#sendMoveEvent(move);

        if (this.isKingAttacked()) {
          console.log('King ' + this.whoseTurnIsIt() + ' is attacked');
        }

        return true;
    }

    isKingAttacked() {
        for (let i = 0; i < this.#pieces.length; i++) {
            if (this.#pieces[i].getCode() == 'K' + this.whoseTurnIsIt()) {
                return this.#pieces[i].isAttacked();
            }
        }
    }

    canCastling(king) {
        let castlings = [];
        // First, make sure the king hasn't moved and is not attacked.
        if (!king.hasMoved() && !king.isAttacked()) {
            // Get the king's rank and the rank number according to the king's side.
            const rank = king.getSide() == 'w' ? this.#board[7] : this.#board[0];
            const rankNumber = king.getSide() == 'w' ? 1 : 8;
            const initialPosition = king.getPosition();
            let isAttacked = false;

            // Check for long castle.
            if (rank[0] == 'R' + king.getSide()) {
                const rook = this.getPieceAtPosition('a' + rankNumber);
                // Check the rook hasn't moved and there is no piece between the king and the rook. 
                if (!rook.hasMoved() && rank[1] == '' && rank[2] == '' && rank[3] == '') {
                    // Now make sure the king is not attacked on the way.
                    const castlingSteps = ['b', 'c', 'd'];
                    // Check for each position.
                    for (let i = 0; i < castlingSteps.length; i++) {
                        king.setPosition(castlingSteps[i] + rankNumber);

                        if (king.isAttacked()) {
                            isAttacked = true;
                        }
                    }

                    if (!isAttacked) {
                        castlings.push('c' + rankNumber);
                    }
                }
            }

            // Check for short castle.
            if (rank[7] == 'R' + king.getSide()) {
                const rook = this.getPieceAtPosition('h' + rankNumber);
                if (!rook.hasMoved() && rank[5] == '' && rank[6] == '') {
                    const castlingSteps = ['f', 'g'];

                    for (let i = 0; i < castlingSteps.length; i++) {
                        king.setPosition(castlingSteps[i] + rankNumber);

                        if (king.isAttacked()) {
                            isAttacked = true;
                        }
                    }

                    if (!isAttacked) {
                        castlings.push('g' + rankNumber);
                    }
                }
            }

            // Set the king back to its initial position.
            king.setPosition(initialPosition);
        }    

        return castlings;
    }

    /*
     * Returns the piece on the board at a given position.
     */
    getPieceAtPosition(position) {
        for (let i = 0; i < this.#pieces.length; i++) {
            if (this.#pieces[i].getPosition() == position) {
                return this.#pieces[i];
            }
        }

        return null;
    }
}
