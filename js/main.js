
document.addEventListener('DOMContentLoaded', () => {

    const chess = new Chess.init();

    //chess.setMove('Pe2e4');
    console.log(chess.getPawnMoves('e2'));
    createChessboard(chess);

    document.querySelectorAll('.piece').forEach((piece) => {
        piece.addEventListener('click', (e) => {
            const coordinates = e.target.parentElement.id;
            const pieceType = e.target.dataset.piece;

            if (pieceType.charAt(1) == chess.getTurn()) {
                console.log(coordinates + ' ' + pieceType);
            }

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
            // Set the grid pattern to apply on the square according to the rank number.
            let patternNumber = i % 2 ? 2 : 1;
            square.classList.add('square', 'grid-pattern-' + patternNumber);

            // A piece is on the square.
            if (chessboard[i][j]) {
                square.innerHTML += '<img src="images/' + chessboard[i][j] + '" data-piece="' + chessboard[i][j] + '" class="piece">';
            }

            // Add the square to the chessboard.
            document.getElementById('chessboard').append(square);
        }
    }
}

