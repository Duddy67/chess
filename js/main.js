
document.addEventListener('DOMContentLoaded', () => {

    const chess = new Chess.init();

    chess.setMove('Qd1d4');
    chess.updateChessboard();
    chess.resetMove();
    //console.log(chess.getPawnMoves('e2'));
    createChessboard(chess);

    chess.possibleMoves = [];

    // Listen to click events coming from the chessboard.
    document.getElementById('chessboard').addEventListener('click', (e) => {
console.log('chessboard');

        // An empty square has been clicked.
        if (e.target.classList.contains('square')) {
            // Check if a piece is moving.
            const from = chess.getMoveFrom();

            // A piece has been moved from a given position to this square.
            if (chess.isObjectNotEmpty(from)) {
                // Get the square position (eg: e4, b6...).
                const position = e.target.id;

                // First make sure the piece is allowed to go to this square.
                if (chess.possibleMoves.includes(position)) {
                    // Set the arrival position.
                    chess.setMoveTo(position);
                    chess.updateChessboard();
                    movePiece(chess);
                    chess.resetMove();
                }
                else {
                    // The piece is not allowed to go to this square.
                    chess.resetMove();
                }

            }

            // Reset the possibleMoves array.
            chess.possibleMoves = [];
            hidePossibleMoves(chess);
        }

        // A piece is clicked.
        if (e.target.classList.contains('piece')) {
            hidePossibleMoves(chess);
            // Get the square position from the parent element (ie: square).
            const position = e.target.parentElement.id;
            const pieceType = e.target.dataset.piece.charAt(0);
            const pieceSide = e.target.dataset.piece.charAt(1);

            // Check if a piece is moving.
            const from = chess.getMoveFrom();

            // The piece is selected, (the from object is empty).
            if (chess.isObjectEmpty(from) && chess.whoseTurnIsIt() == pieceSide) {
                chess.setMoveFrom(position, pieceType);
                // Clone the array returned by the getPieceMoves function.
                chess.possibleMoves = [...getPieceMoves(chess, pieceType, position)];

                // Check the piece can move to one or more squares.
                if (chess.possibleMoves.length) {
                    showPossibleMoves(chess);
                }
                // The piece can't go anywhere.
                else {
                    chess.resetMove();
                }
            }
            // The piece is unselected or another piece on the same side is clicked.
            else if (chess.isObjectNotEmpty(from) && chess.whoseTurnIsIt() == pieceSide) {
//console.log('side ' + pieceSide + ' position' + position + ' wose turn ' + chess.whoseTurnIsIt());
                chess.resetMove();
                chess.possibleMoves = [];

            }
            // The piece is captured.
            else if (chess.isObjectNotEmpty(from) && chess.whoseTurnIsIt() != pieceSide) {
                // First make sure the piece is allowed to go to this square.
                if (chess.possibleMoves.includes(position)) {
                    chess.setMoveTo(position);
                    chess.updateChessboard();
                    movePiece(chess);
                    chess.resetMove();
                    // Reset the possibleMoves array.
                    chess.possibleMoves = [];
                }
            }
        }
    });

});


function createChessboard(chess) {
    const chessboard = chess.getChessboard();
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

    // Loop through the 2 dimensional chessboard array.
    for (let i = 0; i < chessboard.length; i++) {
        for (let j = 0; j < chessboard[i].length; j++) {
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
            if (chessboard[i][j]) {
                square.innerHTML += '<img src="images/' + chessboard[i][j] + '.png" data-piece="' + chessboard[i][j] + '" class="piece">';
            }

            // Add the square to the chessboard.
            document.getElementById('chessboard').append(square);
        }
    }
}

function getPieceMoves(chess, pieceType, position) {
    let moves = [];

    switch (pieceType) {
        case 'K':
            moves = chess.getKingMoves(position);
            break;

        case 'Q':
            moves = chess.getQueenMoves(position);
            break;

        case 'B':
            moves = chess.getBishopMoves(position);
            break;

        case 'N':
            moves = chess.getKnightMoves(position);
            break;

        case 'R':
            moves = chess.getRookMoves(position);
            break;

        case 'P':
            moves = chess.getPawnMoves(position);
            break;
    }

    return moves;
}

/*
 * Moves a piece to a given position. Removes a captured piece if any.
 */
function movePiece(chess) {
    // Get the move to play.
    const from = chess.getMoveFrom().file + chess.getMoveFrom().rank;
    const to = chess.getMoveTo().file + chess.getMoveTo().rank;

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

    // Put the piece on the destination square.
    toSquare.appendChild(piece);
}

function showPossibleMoves(chess) {
    chess.possibleMoves.forEach((move) => {
        //const square = chess.getChessboard()[move.charAt(1)][move.charAt(0)];
        //console.log(chess.getSquare(move));
        document.getElementById(move).classList.add('move');
    });
}

function hidePossibleMoves(chess) {
    document.querySelectorAll('.move').forEach((square) => {
        square.classList.remove('move');
        //console.log(square);
    });

}
