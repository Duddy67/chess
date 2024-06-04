
class Piece {
    #type;   
    #code;   
    #side;   
    #position;   
    #image;   
    #chessboard;   

    constructor(chessboard, code, position) {
        this.#chessboard = chessboard;
        this.#code = code;
        this.#position = position;
        this.#type = code.charAt(0);
        this.#side = code.charAt(1);
        this.#image = 'images/' + code + '.png';
    }
}
