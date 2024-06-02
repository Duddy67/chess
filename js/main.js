
document.addEventListener('DOMContentLoaded', () => {

    const chess = new Chess.init();

    //chess.setMove('Qd1d4');
    //chess.updateChessboard();
    //chess.resetMove();
    //console.log(chess.getPawnMoves('e2'));
    createChessboard(chess);

    chess.possibleMoves = [];

    // Listen to click events coming from the chessboard.
    document.getElementById('chessboard').addEventListener('click', (e) => {
        // An empty square has been clicked.
        if (e.target.classList.contains('square')) {
            // Check if a piece is moving.
            const from = chess.getMoveFrom();

            // A piece has been moved from a given position to this square.
            // N.B: Promoted pawn moves are handle differently.
            if (chess.isObjectNotEmpty(from) && !chess.isPawnPromoted()) {
                // Get the square position (eg: e4, b6...).
                const position = e.target.id;

                // First make sure the piece is allowed to go to this square.
                if (chess.possibleMoves.includes(position)) {
                    // Store the piece's starting position.
                    const from = chess.getMoveFrom();
                    chess.playMove(position);
                    movePiece(from.file + from.rank, position);
                    updateHistory(chess);
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

            // Check if a move is on its way.
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
                chess.resetMove();
                chess.possibleMoves = [];
            }
            // The piece is captured.
            // N.B: Promoted pawn moves are handle differently.
            else if (chess.isObjectNotEmpty(from) && chess.whoseTurnIsIt() != pieceSide && !chess.isPawnPromoted()) {
                // First make sure the moving piece is allowed to go to this square.
                if (chess.possibleMoves.includes(position)) {
                    const from = chess.getMoveFrom();
                    chess.playMove(position);
                    movePiece(from.file + from.rank, position);
                    // Reset the possibleMoves array.
                    chess.possibleMoves = [];
                    updateHistory(chess);
                }
                // The moving piece can't go here.
                else {
                    chess.resetMove();
                    chess.possibleMoves = [];
                }
            }
        }
    });

    // Check the mouse overs of the promoted pawns to display the new piece board.
    document.getElementById('chessboard').addEventListener('mouseover', (e) => {

        if (chess.isPawnPromoted()) {
            let position = '';
            let square;

            if (e.target.classList.contains('square')) {
                position = e.target.id;
                square = e.target;
            }

            if (e.target.classList.contains('piece')) {
                position = e.target.parentElement.id;
                square = e.target.parentElement;
                console.log('piece ' + position);
            }

            // The mouse is over squares which are part of the pawn possible moves.
            // Show the corresponding new piece board for the player to choose from.
            if (chess.possibleMoves.includes(position)) {
                console.log('mouseover ' + position);
                // Adjust the top position of the board 
                const squareHeight = square.clientHeight;
                const top = chess.whoseTurnIsIt() == 'w' ? square.offsetTop - squareHeight : square.offsetTop + squareHeight;
                const left = square.offsetLeft - (squareHeight * 2);
                // Get the new piece board of the side that is currently playing.
                const newPieceBoard = chess.whoseTurnIsIt() == 'w' ? document.getElementById('promotionWhite') : document.getElementById('promotionBlack');
                // Show the new piece board and set its position.
                newPieceBoard.style.display = 'block';
                newPieceBoard.style.left = left + 'px';
                newPieceBoard.style.top = top + 'px';
                // Set the position where the new piece should go.
                newPieceBoard.dataset.position = position;
            }
        }
    });

    // Check for the new piece selected by a player when a pawn is promoted.
    document.querySelectorAll('.new-piece-board').forEach((newPieceBoard) => {
        newPieceBoard.addEventListener('click', (e) => {
            if (e.target.classList.contains('piece')) {
                const pawnPromotionPiece = e.target.dataset.piece;
                const position = e.currentTarget.dataset.position;
                const from = chess.getMoveFrom();
    //console.log(position + ' ' + pawnPromotionPiece);
                movePiece(from.file + from.rank, position, pawnPromotionPiece);
                chess.playMove(position, pawnPromotionPiece);
       console.log(from);
                // Reset the possibleMoves array.
                chess.possibleMoves = [];
                updateHistory(chess);
                e.currentTarget.style.display = 'none';
                hidePossibleMoves(chess);
            }
        });
    });

    document.getElementById('history').addEventListener('click', (e) => {
        if (e.target.classList.contains('move-history')) {
            const moveNumber = e.target.dataset.moveNumber;
            const history = chess.getHistory();
            console.log(history[moveNumber - 1]);
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
function movePiece(from, to, pawnPromotionPiece) {
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
    if (pawnPromotionPiece !== undefined) {
        // Replace the pawn with the promotion piece.
        piece.dataset.piece = pawnPromotionPiece;
        piece.src = 'images/' + pawnPromotionPiece + '.png';
    }

    // Put the piece on the destination square.
    toSquare.appendChild(piece);
}

function updateHistory(chess) {
    const history = chess.getHistory();
    let tr = document.createElement('tr');
    let tdIndex = document.createElement('td');
    let tdMove = document.createElement('td');
    tdMove.setAttribute('class', 'move-history');
    tdMove.setAttribute('data-move', history[history.length - 1].move);
    tdMove.setAttribute('data-move-number', chess.getHistory().length);

    if (chess.whoseTurnIsIt() == 'w') {
        tdMove.classList.add('text-end');
    }

    const index = document.createTextNode(chess.getHistory().length);
    tdIndex.appendChild(index);
    const latestMove = document.createTextNode(history[history.length - 1].move);
    tdMove.appendChild(latestMove);
    tr.appendChild(tdIndex);
    tr.appendChild(tdMove);
    const body = document.getElementById('history').getElementsByTagName('tbody')[0];
    body.appendChild(tr);

    // Scroll to the bottom of the div.
    const wrapper = document.getElementById('history-wrapper');
    wrapper.scrollTop = wrapper.scrollHeight;
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
