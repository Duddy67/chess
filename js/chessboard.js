
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
                    '8': 0, '7': 1, '6': 2, '5': 3, '4': 4, '3': 5, '2': 6, '1': 7};

    // File and rank values to set piece positions.
    #files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    #ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

    // Used to determine whose turn is it (white or black). Starts with white.
    #side = 'w';

    #sideViewPoint = 'w';

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
        // Loop through the 2 dimensional board array.
        for (let i = 0; i < this.#board.length; i++) {
            for (let j = 0; j < this.#board[i].length; j++) {
                // A piece is on the square.
                if (this.#board[i][j]) {
                    const type = this.#board[i][j].charAt(0);
                    const side = this.#board[i][j].charAt(1);
                    const position = this.#files[j] + this.#ranks[i];
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
     * Creates and sends the kingAttacked event.
     */
    #sendKingAttackedEvent() {
        const kingPosition = this.getKingPosition(this.whoseTurnIsIt());

        const event = new CustomEvent('kingAttacked', {
            detail: {
                kingPosition: kingPosition
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
        // Check for "en passant".
        const enPassant = data.specialMove == 'e.p' ? true : false;
        // Get the position of the possible captured piece.
        let capturedPiecePosition = data.to;

        if (data.capturedPiece) {
            if (enPassant) {
                // Get the pawn rank number before it's moved. 
                const rank = data.from.charAt(1);
                // Get the position of the opponent pawn to be captured which is to the left or right side of the pawn.
                capturedPiecePosition = data.to.charAt(0) + rank;
            }

            // Bring the captured piece back on the board.
            data.capturedPiece.setPosition(capturedPiecePosition);
        }

        if (data.newPiece) {
            // Switch back into the promoted pawn.
            this.#pieces.splice(data.piece.getIndex(), 1, data.piece);
        }

        const endSquare = data.capturedPiece && !enPassant ? data.capturedPiece.getCode() : '';

        // Set the board to its previous state.
        this.#board[this.#coordinates[data.from.charAt(1)]][this.#coordinates[data.from.charAt(0)]] = data.piece.getCode();
        this.#board[this.#coordinates[data.to.charAt(1)]][this.#coordinates[data.to.charAt(0)]] = endSquare;

        if (enPassant) {
            this.#board[this.#coordinates[capturedPiecePosition.charAt(1)]][this.#coordinates[capturedPiecePosition.charAt(0)]] = data.capturedPiece.getCode();
        }
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
        // Collect the move data for history and in case of step back.
        let data = {
            'piece': piece,
            'from': piece.getPosition(),
            'to': position,
            'newPiece': newPiece === undefined ? null : newPiece,
            'specialMove': null,
            'capturedPiece': null,
        };

        // A piece is captured.
        if (this.getSquare(position)) {
            // Set the captured piece to the xx position.
            const capturedPiece = this.getPieceAtPosition(position);
            capturedPiece.setPosition('xx');
            data.capturedPiece = capturedPiece;
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
            data.specialMove = 'promotion';
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

            data.specialMove = position == 'g1' || position == 'g8' ? 'O-O' : 'O-O-O'; 
        }
        // En passant (ie: a pawn is moved diagonally to an empty square).
        else if (piece.getType() == 'P' && position.charAt(0) != piece.getPosition().charAt(0) && !this.getSquare(position)) {
            // Compute the opponent pawn position, which is on the left or right side of the pawn.  
            const opponentPawnPosition = position.charAt(0) + piece.getPosition().charAt(1);
            const opponentPawn = this.getPieceAtPosition(opponentPawnPosition);
            // The opponent pawn is captured.
            opponentPawn.setPosition('xx');
            // Move the pawn diagonally.
            piece.setPosition(position);
            data.capturedPiece = opponentPawn;
            data.specialMove = 'e.p';
            // Remove the opponent pawn from the board.
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
          this.#stepBack(data);

          return false;
        }

        if ((piece.getType() == 'K' || piece.getType() == 'R') && !piece.hasMoved()) {
            // The king or rook can no longer castling.
            piece.moved();
        }

        this.switchSides();

        // Add some extra information to data.
        data.board = this.#board;
        data.pieceCode = piece.getCode();
        data.move = piece.getType() + position;

        this.#history.push(data);

        this.#sendMoveEvent(data);

        if (this.isKingAttacked()) {
          console.log('King ' + this.whoseTurnIsIt() + ' is attacked');
          this.#sendKingAttackedEvent();
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

    /*
     * Checks whether castling is possible.
     * Returns castling squares.
     */
    canCastling(king) {
        let castlings = [];
        // First, make sure the king hasn't moved and is not attacked.
        if (!king.hasMoved() && !king.isAttacked()) {
            // Get the king's rank and the rank number according to both the king's side and the side view point.

            // Get the first array of the 2 dimensional board array. 
            let rank = this.#board[0]; // side = b && side view point = w OR  side = w && side view point = b

            if ((this.#sideViewPoint == 'w' && king.getSide() == 'w') || (this.#sideViewPoint == 'b' && king.getSide() == 'b')) {
                // Get the last array of the 2 dimensional board array. 
                rank = this.#board[7];
            }

            let rankNumber = 8; // side = b && side view point = b OR  side = b && side view point = w

            if ((king.getSide() == 'w' && this.#sideViewPoint == 'w') || (king.getSide() == 'w' && this.#sideViewPoint == 'b')) {
                rankNumber = 1;
            }

            const initialPosition = king.getPosition();
            let isAttacked = false;

            // Initialize variables to fit with castling on the left side. 

            // The file of the rook to check.
            let rookFile = this.#sideViewPoint == 'w' ? 'a' : 'h'; // ok
            // Check for a short or long castling according to the side view point.
            let castlingSteps = this.#sideViewPoint == 'w' ? ['b', 'c', 'd'] : ['g', 'f'];
            // Check empty squares accordingly.
            let emptySquares = this.#sideViewPoint == 'w' ? rank[1] == '' && rank[2] == '' && rank[3] == '' : rank[1] == '' && rank[2] == '';
            let castlingFile = this.#sideViewPoint == 'w' ? 'c' : 'g';

            // Check for the rook on the left side of the rank.
            if (rank[0] == 'R' + king.getSide()) {
                const rook = this.getPieceAtPosition(rookFile + rankNumber);

                // Check the rook hasn't moved and the squares between the king and the rook are empty. 
                if (!rook.hasMoved() && emptySquares) {
                    // Now make sure the king is not attacked on the way.
                    // Check for each position.
                    for (let i = 0; i < castlingSteps.length; i++) {
                        king.setPosition(castlingSteps[i] + rankNumber);

                        if (king.isAttacked()) {
                            isAttacked = true;
                        }
                    }

                    if (!isAttacked) {
                        castlings.push(castlingFile + rankNumber);
                    }
                }
            }

            // Reinitialize variables to fit with castling on the right side. 
            rookFile = this.#sideViewPoint == 'w' ? 'h' : 'a';
            castlingSteps = this.#sideViewPoint == 'w' ? ['g', 'f'] : ['b', 'c', 'd'];
            emptySquares = this.#sideViewPoint == 'w' ? rank[5] == '' && rank[6] == '' : rank[4] == '' && rank[5] == '' && rank[6] == '';
            castlingFile = this.#sideViewPoint == 'w' ? 'g' : 'c';

            // Check for the rook on the right side of the rank.
            if (rank[7] == 'R' + king.getSide()) {
                const rook = this.getPieceAtPosition(rookFile + rankNumber);
                if (!rook.hasMoved() && emptySquares) {
                    for (let i = 0; i < castlingSteps.length; i++) {
                        king.setPosition(castlingSteps[i] + rankNumber);

                        if (king.isAttacked()) {
                            isAttacked = true;
                        }
                    }

                    if (!isAttacked) {
                        castlings.push(castlingFile + rankNumber);
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

    getKingPosition(side) {
        for (let i = 0; i < this.#pieces.length; i++) {
            if (this.#pieces[i].getCode() == 'K' + side) {
                return this.#pieces[i].getPosition();
            }
        }

        return null;
    }

    getFiles() {
        return this.#files;
    }

    getRanks() {
        return this.#ranks;
    }

    getSideViewPoint() {
        return this.#sideViewPoint;
    }

    /*
     * Reverses all the board data.
     */
    flipboard() {
        // First reverse the array rows. 
        this.#board.reverse();

        // Then reverse the elements in each row.
        for (let i = 0; i < this.#MAX_SQUARES; i++) {
            this.#board[i].reverse();
        }

        // Get the coordinate keys.
        let keys = Object.keys(this.#coordinates);
        // Compute the last index of an height element array.
        const lastIndex = this.#MAX_SQUARES - 1;

        // Reverse the coordinate value for each key.
        keys.forEach((key) => {
            // Get the reversed value by subtracting the actual value to the last index number.
            this.#coordinates[key] = this.#coordinates[key] < lastIndex ? lastIndex - parseInt(this.#coordinates[key]) : 0;
        });

        this.#files.reverse();
        this.#ranks.reverse();

        // Switch the side view point accordingly.
        this.#sideViewPoint = this.#sideViewPoint == 'w' ? 'b' : 'w';
    }
}
