
document.addEventListener('DOMContentLoaded', () => {

    const chessboard = new Chessboard();
    let pieces = createChessboard(chessboard);
    console.log(chessboard.getPieces());

    chessboard.possibleMoves = [];

    //const piece = new Pawn(chessboard, 'w', 'e2');
    //console.log(piece.getMoves());

    let selectedPiece = [];

    // Listen to click events coming from the chessboard.
    document.getElementById('chessboard').addEventListener('click', (e) => {
        // An empty square has been clicked.
        if (e.target.classList.contains('square')) {
            // A piece has been moved from a given position to this square.
            // N.B: Promoted pawn moves are handled differently.
            if (selectedPiece.length) {
                // Get the square position (eg: e4, b6...).
                const position = e.target.id;

                // First make sure the piece is allowed to go to this square.
                if (selectedPiece[0].getMoves().includes(position)) {
                    // Store the piece's starting position.
                    const from = selectedPiece[0].getPosition();
                    chessboard.playMove(selectedPiece[0], position);
                    movePiece(from, position);
                    selectedPiece[0].setPosition(position);
                    //updateHistory(chess);
                }

            }

            hidePossibleMoves();
        }

        // A piece is clicked.
        if (e.target.classList.contains('piece')) {
            // Get the square position from the parent element (ie: square).
            const position = e.target.parentElement.id;
            const pieceType = e.target.dataset.piece.charAt(0);
            const pieceSide = e.target.dataset.piece.charAt(1);   

            if (selectedPiece.length == 0) {
                // 
                selectedPiece.push(getSelectedPiece(pieces, position));

                // Check the piece can move to one or more squares.
                if (selectedPiece[0].getMoves().length) {
                    showPossibleMoves(selectedPiece[0]);
                }
            }
        }
    });
});

function createChessboard(chessboard) {
    const board = chessboard.getBoard();
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    let pieces = [];

    // Loop through the 2 dimensional chessboard array.
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            let square = document.createElement('div');
            // Set the position coordinates as id (eg: a8, e2...).
            square.setAttribute('id', files[j] + ranks[i]);

            // Check for the chessboard coordinate marks.

            // The a1 square requires 2 mark, (a and 1).
            if (ranks[i] == 1 && files[j] == 'a') {
                // Use a class that manages 2 background images.
                square.setAttribute('class', 'square-a1');
            }
            // Display the file letters all along the rank 1.
            else if (ranks[i] == 1) {
                square.setAttribute('class', 'file-' + files[j]);
            }
            // Display the rank numbers all along the file a.
            else if (files[j] == 'a') {
                square.setAttribute('class', 'rank-' + ranks[i]);
            }

            // Set the grid pattern to apply on the square according to the rank number.
            let patternNumber = i % 2 ? 2 : 1;
            square.classList.add('square', 'grid-pattern-' + patternNumber);

            // A piece is on the square.
            if (board[i][j]) {
                const type = board[i][j].charAt(0);
                const side = board[i][j].charAt(1);
                const position = files[j] + ranks[i];
                let piece;

                switch (type) {
                    case 'K':
                        piece = new King(chessboard, side, position);
                        break;

                    case 'Q':
                        piece = new Queen(chessboard, side, position);
                        break;

                    case 'R':
                        piece = new Rook(chessboard, side, position);
                        break;

                    case 'B':
                        piece = new Bishop(chessboard, side, position);
                        break;

                    case 'N':
                        piece = new Knight(chessboard, side, position);
                        break;

                    case 'P':
                        piece = new Pawn(chessboard, side, position);
                        break;
                }

                pieces.push(piece);

                square.innerHTML += '<img src="' + piece.getImage() + '" data-piece="' + board[i][j] + '" class="piece">';
            }

            // Add the square to the chessboard.
            document.getElementById('chessboard').append(square);
        }
    }

   return pieces;
}

function getSelectedPiece(pieces, position) {
    for (let i = 0; i < pieces.length; i++) {
        if (pieces[i].getPosition() == position) {
            return pieces[i];
        }
    }

    return null;
}

function showPossibleMoves(piece) {
    piece.getMoves().forEach((move) => {
        //const square = chess.getChessboard()[move.charAt(1)][move.charAt(0)];
        document.getElementById(move).classList.add('move');
    });
}

function hidePossibleMoves() {
    document.querySelectorAll('.move').forEach((square) => {
        square.classList.remove('move');
        //console.log(square);
    });
}

/*
 * Moves a piece to a given position on the chessboard. Removes a captured piece if any.
 */
function movePiece(from, to, newPiece) {
    const fromSquare = document.getElementById(from);
    // Get the piece to move and remove it from the square.
    const piece = fromSquare.firstChild;
    fromSquare.removeChild(fromSquare.firstElementChild);

    const toSquare = document.getElementById(to);

    // A piece is captured.
    if (toSquare.hasChildNodes()) {
        // Remove the captured piece.
        toSquare.innerHTML = '';
    }

    // Check for promoted pawn.
    if (newPiece !== undefined) {
        // Replace the pawn with the new piece.
        piece.dataset.piece = newPiece;
        piece.src = 'images/' + newPiece + '.png';
    }

    // Put the piece on the destination square.
    toSquare.appendChild(piece);
}
