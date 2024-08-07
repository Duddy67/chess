
document.addEventListener('DOMContentLoaded', () => {

    const chessboard = new Chessboard();
    createChessboard(chessboard);
    const api = new Lichess();
    const playGame = new PlayGame(chessboard);

    let selectedPiece = [];

    document.getElementById('flipBoard').addEventListener('click', (e) => {
        chessboard.flipboard();
        createChessboard(chessboard);
        //console.log(chessboard.getBoard());
    });

    document.getElementById('puzzle').addEventListener('click', (e) => {
        console.log('puzzle');
        //console.log(api);
        api.getPuzzleById('001XA').then(data => {
            //console.log(data.game.pgn);
            game(playGame, data.game.pgn, chessboard);
        }).catch(error => {
            console.log('Promise rejected: ' + error.message);
        });
    });

    // Listen to click events coming from the chessboard.
    document.getElementById('chessboard').addEventListener('click', (e) => {

        // Promoted pawn moves are handled differently.
        if (selectedPiece.length && selectedPiece[0].getType() == 'P' && selectedPiece[0].isPromoted()) {
            return;
        }

        // An empty square has been clicked.
        if (e.target.classList.contains('square')) {
            // A piece has been moved from a given position to this square.
            if (selectedPiece.length) {
                // Get the square position (eg: e4, b6...).
                const position = e.target.id;

                // First make sure the piece is allowed to go to this square.
                if (selectedPiece[0].getMoves().includes(position)) {
                    // Store the piece's starting position.
                    const from = selectedPiece[0].getPosition();

                    // Check the move can be played.
                    if (chessboard.movePiece(selectedPiece[0], position)) {

                        // En passant (ie: a pawn is moved diagonally to an empty square).
                        if (selectedPiece[0].getType() == 'P' && position.charAt(0) != from.charAt(0)) {
                            // Get the pawn rank number before it's moved. 
                            const rank = from.charAt(1);
                            // First, move the pawn to the left or right side in order to capture the opponent pawn.
                            movePiece(from, position.charAt(0) + rank);
                            // Then, move the pawn to the initial end position.
                            movePiece(position.charAt(0) + rank, position);
                        }
                        // Regular move.
                        else {
                            movePiece(from, position);
                        }
                    }
                }
                // A king is castling.
                else if (selectedPiece[0].getType() == 'K' && !selectedPiece[0].hasMoved() && chessboard.getCastlingSquares().includes(position)) {
                    // Store the king's starting position.
                    const from = selectedPiece[0].getPosition();
                    // Get the rook positions before and after the castling.
                    const rookPositions = chessboard.getCastlingRookPositions(selectedPiece[0], position);
                    // Castling.
                    chessboard.movePiece(selectedPiece[0], position);

                    movePiece(from, position);
                    movePiece(rookPositions.from, rookPositions.to);
                }
            }

            hidePossibleMoves();
            hidePossibleCastlings();
            selectedPiece = []
        }

        // A piece is clicked.
        if (e.target.classList.contains('piece')) {
            // Get the square position from the parent element (ie: square).
            const position = e.target.parentElement.id;
            const pieceType = e.target.dataset.piece.charAt(0);
            const pieceSide = e.target.dataset.piece.charAt(1);   

            // The piece is selected.
            if (selectedPiece.length == 0 && pieceSide == chessboard.whoseTurnIsIt()) {
                // Select the piece. 
                selectedPiece.push(chessboard.getPieceAtPosition(position));

                // Check the piece can move to one or more squares.
                if (selectedPiece[0].getMoves().length) {
                    showPossibleMoves(selectedPiece[0]);

                    if (pieceType == 'K') {
                        showPossibleCastlings(chessboard.canCastling(selectedPiece[0]));
                    }
                }
            }
            // The piece is unselected or another piece on the same side is clicked.
            else if (selectedPiece.length && chessboard.whoseTurnIsIt() == pieceSide) {
                hidePossibleMoves();
                hidePossibleCastlings();
                // Unselect the current piece.
                selectedPiece = []
            }
            // The piece is captured.
            else if (selectedPiece.length && chessboard.whoseTurnIsIt() != pieceSide) {
                // First make sure the piece is allowed to go to this square.
                if (selectedPiece[0].getMoves().includes(position)) {
                    // Store the piece's starting position.
                    const from = selectedPiece[0].getPosition();

                    // Check the move can be played.
                    if (chessboard.movePiece(selectedPiece[0], position)) {
                        movePiece(from, position);
                    }
                }

                hidePossibleMoves();
                selectedPiece = []
            }
        }
    });

    // Check the mouse over events of the promoted pawns to display the new piece board.
    document.getElementById('chessboard').addEventListener('mouseover', (e) => {

        // Check the selected piece is a pawn and is promoted.
        if (selectedPiece.length && selectedPiece[0].getType() == 'P' && selectedPiece[0].isPromoted()) {
            let position = '';
            let square;

            if (e.target.classList.contains('square')) {
                position = e.target.id;
                square = e.target;
            }

            if (e.target.classList.contains('piece')) {
                position = e.target.parentElement.id;
                square = e.target.parentElement;
            }

            // The mouse is over squares which are part of the pawn possible moves.
            // Show the corresponding new piece board for the player to choose from.
            if (selectedPiece[0]['getMoves']().includes(position)) {
                // Adjust the top and left positions of the board
                const squareHeight = square.clientHeight;
                let top;

                if ((chessboard.whoseTurnIsIt() == 'w' && chessboard.getSideViewPoint() == 'w') ||
                    (chessboard.whoseTurnIsIt() == 'b' && chessboard.getSideViewPoint() == 'b'))  {
                    top = square.offsetTop - squareHeight;
                }
                else {
                    top = square.offsetTop + squareHeight;

                }

                const left = square.offsetLeft - (squareHeight * 2);

                // Get the new piece board of the side that is currently playing.
                const newPieceBoard = chessboard.whoseTurnIsIt() == 'w' ? document.getElementById('promotionWhite') : document.getElementById('promotionBlack');

                // Show the new piece board and set its position.
                newPieceBoard.style.display = 'block';
                newPieceBoard.style.left = left + 'px';
                newPieceBoard.style.top = top + 'px';

                // Set the position where the new piece should go.
                newPieceBoard.dataset.position = position;
            }
        }
    });

    // Check for the new piece selected by the player when a pawn is promoted.
    document.querySelectorAll('.new-piece-board').forEach((newPieceBoard) => {
        newPieceBoard.addEventListener('click', (e) => {
            if (e.target.classList.contains('piece')) {
                const newPiece = e.target.dataset.piece;
                // Get the position where the new piece should go.
                const position = e.currentTarget.dataset.position;

                // Store the piece's starting position.
                const from = selectedPiece[0].getPosition();

                // Check the move can be played.
                if (chessboard.movePiece(selectedPiece[0], position, newPiece)) {
                    movePiece(from, position, newPiece);
                }

                // Reset the data.
                hidePossibleMoves();
                selectedPiece = []
                // Hide the new piece board.
                e.currentTarget.style.display = 'none';
            }
        });
    });

    // Check for custom events.

    // Dispatched after each move.
    document.addEventListener('move', (e) => {
        updateHistory(chessboard);
        hideKingAttacked();
    });

    document.addEventListener('kingAttacked', (e) => {
        const square = document.getElementById(e.detail.kingPosition)
        square.classList.add('king-attacked');
    });
});

function createChessboard(chessboard) {
    const board = chessboard.getBoard();
    const files = chessboard.getFiles();
    const ranks = chessboard.getRanks();
    // 
    const letterRank = chessboard.getSideViewPoint() == 'w' ? 1 : 8;
    const numberFile = chessboard.getSideViewPoint() == 'w' ? 'h' : 'a';
    let pieces = [];

    // Delete all possible children.
    document.getElementById('chessboard').replaceChildren();

    // Loop through the 2 dimensional chessboard array.
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            let square = document.createElement('div');
            // Set the position coordinates as id (eg: a8, e2...).
            square.setAttribute('id', files[j] + ranks[i]);

            // Check for the chessboard coordinate marks.

            // The h1 square requires 2 mark, (h and 1).
            if (ranks[i] == letterRank && files[j] == numberFile) {
                let html = '<span class="rank-numbers">' + ranks[ranks.length - 1] + '</span>';
                html += '<span class="file-letters">' + files[j] + '</span>';
                square.innerHTML = html;
            }
            // Display the file letters all along the rank 1.
            else if (ranks[i] == letterRank) {
                square.innerHTML = '<span class="file-letters">' + files[j] + '</span>';
            }
            // Display the rank numbers all along the file h.
            else if (files[j] == numberFile) {
                square.innerHTML = '<span class="rank-numbers">' + ranks[i] + '</span>';
            }

            // Set the grid pattern to apply on the square according to the rank number.
            let patternNumber = i % 2 ? 2 : 1;
            square.classList.add('square', 'grid-pattern-' + patternNumber);

            // A piece is on the square.
            if (board[i][j]) {
                square.innerHTML += '<img src="images/' + board[i][j] + '.png" data-piece="' + board[i][j] + '" class="piece">';
            }

            // Add the square to the chessboard.
            document.getElementById('chessboard').append(square);
        }
    }
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
    const moves = piece.getMoves();

    for (let i = 0; i < moves.length; i++) {
        const square = document.getElementById(moves[i]);
        let capturedPiece = false;

        // Check for possible captured opponent piece.
        for (const child of square.children) {
            if (child.tagName == 'IMG') {
                capturedPiece = true;
            }
        }

        if (capturedPiece) {
            square.classList.add('capture');
        }
        else {
            square.classList.add('move');
        }
    }
}

function hidePossibleMoves() {
    document.querySelectorAll('.move, .capture').forEach((square) => {
        square.classList.remove('move');
        square.classList.remove('capture');
    });
}

function showPossibleCastlings(castlings) {
    castlings.forEach((castling) => {
        document.getElementById(castling).classList.add('castling');
    });
}

function hidePossibleCastlings() {
    document.querySelectorAll('.castling').forEach((square) => {
        square.classList.remove('castling');
    });
}

function hideKingAttacked() {
    const squares = document.getElementsByClassName('king-attacked');

    if (squares.length) {
        squares[0].classList.remove('king-attacked');
    }
} 

/*
 * Moves a piece to a given position on the HTML chessboard. Removes a captured piece if any.
 */
function movePiece(from, to, newPiece) {
    // Get the piece to move and remove it from the starting square.

    // N.B: Use querySelector to get the first child element of type img from the starting square (ie: id = from).
    const piece = document.querySelector('#' + from + ' > img:first-of-type');
    // Remove the piece from the starting square.
    document.getElementById(from).removeChild(document.querySelector('#' + from + ' > img:first-of-type'));

    // A piece is captured.
    if (document.querySelector('#' + to + ' > img:first-of-type')) {
        // Remove the captured piece.
        document.getElementById(to).removeChild(document.querySelector('#' + to + ' > img:first-of-type'));
    }

    // Check for promoted pawn.
    if (newPiece !== undefined) {
        // Replace the pawn with the new piece.
        piece.dataset.piece = newPiece;
        piece.src = 'images/' + newPiece + '.png';
    }

    // Check for a possible square mark (ie: span element).
    const mark = document.querySelector('#' + to + ' > span:first-of-type');

    // Put the piece on the destination square.

    if (mark) {
        // N.B: Do not use appendChild to move the piece or the span element will be deleted.
        mark.after(piece);
    }
    else {
        document.getElementById(to).appendChild(piece);
    }
}

function updateHistory(chessboard) {
    const history = chessboard.getHistory();
    let tr = document.createElement('tr');
    let tdIndex = document.createElement('td');
    let tdMove = document.createElement('td');
    tdMove.setAttribute('class', 'move-history');
    tdMove.setAttribute('data-move', history[history.length - 1].move);
    tdMove.setAttribute('data-move-number', chessboard.getHistory().length);

    if (chessboard.whoseTurnIsIt() == 'w') {
        tdMove.classList.add('text-end');
    }

    const index = document.createTextNode(chessboard.getHistory().length);
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

    const sideToPlay = chessboard.whoseTurnIsIt() == 'w' ? 'White' : 'Black';
    document.getElementById('sideToPlay').innerHTML = sideToPlay;

}

function game(playGame, pgn, chessboard) {
  let moves = pgn.split(' ');
  console.log(moves);

  const parsings = {
                     P_move: /^[a-h]{1}[0-8]{1}$/, 
                     P_capture_dsbg: /^[a-h]{1}x[a-h]{1}[0-8]{1}$/,
                     R_move: /^R[a-h]{1}[0-8]{1}$/,
                     R_move_dsbg: /^R[a-h]{2}[0-8]{1}$/,
                     R_capture: /^Rx[a-h]{1}[0-8]{1}$/,
                     R_capture_dsbg: /^R[a-h]{1}x[a-h]{1}[0-8]{1}$/,
                     N_move: /^N[a-h]{1}[0-8]{1}$/,
                     N_move_dsbg: /^N[a-h]{2}[0-8]{1}$/,
                     N_capture: /^Nx[a-h]{1}[0-8]{1}$/,
                     N_capture_dsbg: /^N[a-h]{1}x[a-h]{1}[0-8]{1}$/,
                     B_move: /^B[a-h]{1}[0-8]{1}$/,
                     B_capture: /^Bx[a-h]{1}[0-8]{1}$/,
                     Q_move: /^Q[a-h]{1}[0-8]{1}$/,
                     Q_capture: /^Qx[a-h]{1}[0-8]{1}$/,
                     K_move: /^K[a-h]{1}[0-8]{1}$/,
                     K_capture: /^Kx[a-h]{1}[0-8]{1}$/,
                     C_king_side: /^O-O$/,
                     C_queen_side: /^O-O-O$/,
  };

  /*playGame.pawn('a4');
  playGame.pawn('h5');
  playGame.rook('Ra3');
  playGame.rook('Rh6');
  playGame.pawn('h4');
  playGame.pawn('a5');
  playGame.rook('Rhh3');
  playGame.rook('Raa6');
  playGame.rook('Rae3');
  playGame.rook('Rae6');
  playGame.rook('Rxe6');*/
  /*playGame.pawn('fxg6');
  playGame.pawn('a5');
  playGame.pawn('g7');
  playGame.pawn('a4');
  playGame.pawn('h8=Q');*/
  //playGame.knight('Nf3');
  //playGame.knight('Nc6');
  //playGame.knight('Nc3');
  //playGame.knight('Nf6');
  //playGame.knight('Ne4');
  //playGame.pawn('g5');
  //playGame.knight('Nfxg5');
  /*playGame.pawn('d4');
  playGame.pawn('d5');
  playGame.bishop('Bg5');
  playGame.bishop('Bg4');
  playGame.pawn('e4');
  playGame.pawn('e5');
  playGame.bishop('Bb5');
  playGame.pawn('c6');
  playGame.pawn('c3');
  playGame.bishop('Bb4');
  playGame.bishop('Bxc6');
  createChessboard(chessboard);*/

  console.log(/^[a-h]{1}[0-8]{1}\+?$/.test('Ne5+'));
//const str = 'h8=Q'
//const promotion = str.substring(str.length - 2, str.length - 1) == '=' ? str.slice(-1) : undefined;
//console.log(str.substring(0, 2));
  moves = ['e4', 'e5', 'Qg4', 'Qg5', 'Kd1', 'Kd8'];
  for (let i = 0; i < moves.length; i++) {
      let unknown = true;

      for (let [key, regex] of Object.entries(parsings)) {
          if (regex.test(moves[i])) {
              unknown = false;
              //console.log(key + ' ' + moves[i]);

              switch (key.charAt(0)) {
                  case 'P':
                      playGame.pawn(moves[i]);
                      break;

                  case 'R':
                      playGame.rook(moves[i]);
                      break;

                  case 'N':
                      playGame.knight(moves[i]);
                      break;

                  case 'B':
                      playGame.bishop(moves[i]);
                      break;

                  case 'Q':
                      playGame.queen(moves[i]);
                      break;

                  case 'K':
                      playGame.king(moves[i]);
                      break;
              }
          }
      }

      if (unknown) {
          console.log('Unknown: ' + moves[i]);
      }

  }
  createChessboard(chessboard);
}

function delay(i) {
      setTimeout(() => {
          console.log('i ' + i)
      },i * 1000);
}

