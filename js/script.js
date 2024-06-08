
document.addEventListener('DOMContentLoaded', () => {

    const chessboard = new Chessboard();

    console.log(chessboard.getBoard());

    const piece = new Queen(chessboard, 'w', 'a2');
    console.log(piece.getMoves());
});
