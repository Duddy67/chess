
document.addEventListener('DOMContentLoaded', () => {

    const chessboard = new Chessboard();
    let pieces = createChessboard(chessboard);

    console.log(pieces);

    const piece = new Pawn(chessboard, 'w', 'e2');
    //console.log(piece.getMoves());
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

