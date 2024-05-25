
document.addEventListener('DOMContentLoaded', () => {

    const chess = new Chess.init();

    chess.setMove('Nb1d5');
    //console.log(chess.getPawnMoves('e2'));
    createChessboard(chess);

    document.querySelectorAll('.square').forEach((square) => {
        square.addEventListener('click', (e) => {

            // An empty square has been clicked.
            if (e.target.classList.contains('square')) {
                const position = e.target.id;
                console.log('square');

                const from = chess.getMoveFrom();

                if (Object.keys(from).length !== 0) {

                }

                hideMoves(chess);
            }
            // A piece has been clicked.
            else {
                hideMoves(chess);
                const position = e.target.parentElement.id;
                const pieceType = e.target.dataset.piece;
                console.log('piece: ' + position);

                const from = chess.getMoveFrom();

                // The piece is selected.
                if (Object.keys(from).length === 0) {
                    const moves = getPieceMoves(chess, pieceType.charAt(0), position);
                    console.log(moves);
                    showMoves(chess, moves);
                }
                // The piece is captured.
                else {

                }
            }
            
            const coordinates = e.target.parentElement.id;
            const pieceType = e.target.dataset.piece;

            /*if (pieceType.charAt(1) == chess.getTurn()) {
                let moves = [];
                switch (pieceType.charAt(0)) {
                    case 'K':
                        moves = chess.getKingMoves(coordinates);
                        break;

                    case 'Q':
                        moves = chess.getQueenMoves(coordinates);
                        break;

                    case 'B':
                        moves = chess.getBishopMoves(coordinates);
                        break;

                    case 'N':
                        moves = chess.getKnightMoves(coordinates);
                        break;

                    case 'R':
                        moves = chess.getRookMoves(coordinates);
                        break;

                    case 'P':
                        moves = chess.getPawnMoves(coordinates);
                        break;
                }

                //showMoves(chess, moves);
            }*/
        });
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

function showMoves(chess, moves) {
    moves.forEach((move) => {
        console.log(move);
        //const square = chess.getChessboard()[move.charAt(1)][move.charAt(0)];
        console.log(chess.getSquare(move));
        document.getElementById(move).classList.add('move');
    });
}

function hideMoves(chess) {
    document.querySelectorAll('.move').forEach((square) => {
        square.classList.remove('move');
        //console.log(square);
    });

}
