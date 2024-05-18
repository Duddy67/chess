
document.addEventListener('DOMContentLoaded', () => {

    const chess = new Chess.init();

    chess.setMove('Pe2e4');
    //console.log(chess.getChessboard());
    createChessboard(chess);


    let board = [
        ['Rb', 'Nb', 'Bb', 'Qb', 'Kb', 'Bb', 'Nb', 'Rb'],
        ['Pb', 'Pb', 'Pb', 'Pb', 'Pb', 'Pb', 'Pb', 'Pb'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['Pw', 'Pw', 'Pw', 'Pw', 'Pw', 'Pw', 'Pw', 'Pw'],
        ['Rw', 'Nw', 'Bw', 'Qw', 'Kw', 'Bw', 'Nw', 'Rw'],
    ];

    const coordinates = {'a': 0, 'b': 1, 'c': 2, 'd': 3, 'e': 4, 'f': 5, 'g': 6, 'h': 7, '1': 7, '2': 6, '3': 5, '4': 4, '5': 3, '6': 2, '7': 1, '8': 0}

    let board2 = [
        [
            {'coordinates': 'a8', 'piece': 'r', 'color': 'white'},
        {'id': 'b8', 'piece': 'r'},
        {'id': 'c8', 'piece': 'r'},
        {'id': 'd8', 'piece': 'r'},
        {'id': 'e8', 'piece': 'r'},
        {'id': 'f8', 'piece': 'r'},
        {'id': 'g8', 'piece': 'r'},
        {'id': 'h8', 'piece': 'r'}],
    ];

    let board3 = {'a8': {'piece': 'r'}, 'b8': {'piece': 'n'}};

    let piece = {'type': 'r', 'color': 'w', 'position': 'a8'};
    let pieces = {'rw': {'type': 'r', 'color': 'w', 'position': 'a8', 'status': ''}, 'nw': {'type': 'n', 'color': 'w', 'position': 'b8'}};

    const move = {'start': {'col': 'e', 'rank': '2'}, 'end': {'col': 'e', 'rank': '4'}, 'piece': 'Pw', 'take': ''};
    //const col = 'e';
    //const rank = '2';

    //board[coordinates[rank]][coordinates[col]];

    board[coordinates[move.start.rank]][coordinates[move.start.col]] = '';
    board[coordinates[move.end.rank]][coordinates[move.end.col]] = move.piece;
    //console.log(board[coordinates[move.start.rank]][coordinates[move.start.col]]);
    //console.log(board);
});


function createChessboard(chess) {
    const chessboard = chess.getChessboard();
    const col = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const rank = ['8', '7', '6', '5', '4', '3', '2', '1'];

    for (let i = 0; i < chessboard.length; i++) {
        for (let j = 0; j < chessboard[i].length; j++) {
            //console.log(col[j] + ' ' + rank[i]);
            let patternNumber = i % 2 ? 2 : 1;
            console.log(patternNumber);
            let square = document.createElement('div');
            square.setAttribute('id', col[j] + rank[i]);
            square.classList.add('square', 'grid-pattern-' + patternNumber);

            if (chessboard[i][j]) {
                square.innerHTML += '<img src="images/' + chessboard[i][j] + '" class="piece">';
            }

            document.getElementById('chessboard').append(square);
        }
    }
}

