
// Anonymous function with namespace.
const Chess = (function() {
    // The private key that gives access to the storage for private properties.
    const _key = {};

    const _private = function() {
        // The storage object for private properties.
        const privateProperties = {};

        return function(key) {
            // Compare the given key against the actual private key.
            if (key === _key) {
                return privateProperties;
            }

            // If the user of the class tries to access private
            // properties, they won't have the access to the `key`
            console.error('Cannot access private properties');
            return undefined;
        };
    };

    // Private functions.

    function _initProperties(_) {
        _(_key).turn = 'w'; 
        _(_key).chessboard = [
            ['Rb', 'Nb', 'Bb', 'Qb', 'Kb', 'Bb', 'Nb', 'Rb'],
            ['Pb', 'Pb', 'Pb', 'Pb', 'Pb', 'Pb', 'Pb', 'Pb'],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['Pw', 'Pw', 'Pw', 'Pw', 'Pw', 'Pw', 'Pw', 'Pw'],
            ['Rw', 'Nw', 'Bw', 'Qw', 'Kw', 'Bw', 'Nw', 'Rw'],
        ];
        _(_key).ranks = [1, 2, 3, 4, 5, 6, 7, 8];
        _(_key).files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        // Maps between the chess ranks and files and the 2 dimensional array indexes.
        _(_key).coordinates = {'a': 0, 'b': 1, 'c': 2, 'd': 3, 'e': 4, 'f': 5, 'g': 6, 'h': 7,
                               '1': 7, '2': 6, '3': 5, '4': 4, '5': 3, '6': 2, '7': 1, '8': 0}
        _(_key).pieceAbbreviations = ['K', 'Q', 'R', 'N', 'B', 'P'];
        _(_key).move = {'from': {'rank': '', 'file': ''}, 'to': {'rank': '', 'file': ''}, 'piece': '', 'capture': false};
    }

    function _updateChessboard(_) {
        const coordinates = _(_key).coordinates;
        const move = _(_key).move;
        // Get the piece color (ie: the second letter of the string). 
        const color = _(_key).chessboard[coordinates[move.from.rank]][coordinates[move.from.file]].slice(1, 2);

        // Update the piece position on the chessboard.
        _(_key).chessboard[coordinates[move.from.rank]][coordinates[move.from.file]] = '';
        _(_key).chessboard[coordinates[move.to.rank]][coordinates[move.to.file]] = move.piece + color;
    }

    function getSquare(_, position) {
        const rank = position.charAt(1);
        const file = position.charAt(0);

        return _(_key).chessboard[_(_key).coordinates[rank]][_(_key).coordinates[file]];
    }

    /*
     * Returns the position after one step forward starting from the given initial position.
     * In case the position is beyond the chessboard array index, the initial position is returned.
     */
    function _getOneStepForwardPosition(_, initialPosition) {
        const file = initialPosition.charAt(0); 
        let rank = initialPosition.charAt(1);

        // One step forward from the white viewpoint.
        if (_(_key).turn == 'w') {
            // Check for boundary effect.
            rank = parseInt(rank) < 8 ? parseInt(rank) + 1 : rank;
        }
        // One step forward from the black viewpoint.
        else {
            rank = parseInt(rank) > 1 ? parseInt(rank) - 1 : rank;
        }

        return file + rank;
    }

    function _switchTurn(_) {
        _(_key).turn = _(_key).turn == 'w' ? 'b' : 'w'; 
    }

    // Function used as a class constructor.
    const _Chess = function() {
        // Creates a private object
        this._ = _private(); 

        _initProperties(this._);
    };

    // Public functions.

    _Chess.prototype = {
        getChessboard : function() {
            return this._(_key).chessboard;
        },

        getTurn: function() {
            return this._(_key).turn;
        },

        getPawnMoves: function(position) {
            const steps = (this._(_key).turn == 'w' && position.charAt(1) == 2) || (this._(_key).turn == 'b' && position.charAt(1) == 7) ? 2 : 1;
            let moves = [];
            const initialPosition = position;

            for (let i = 0; i < steps; i++) {
                position = _getOneStepForwardPosition(this._, position);

                if (position == initialPosition || getSquare(this._, position)) {
                    break;
                }

                moves.push(position);
            }

            return moves;
        },

        setMove: function(move) {

            // The UCI protocol doesn't use any abbreviation for pawns.
            if (!/^[A-Z]/.test(move)) {
                move = 'P' + move;
            }
 console.log(_getOneStepForwardPosition(this._, 'a7'));

            this._(_key).move.piece = move.charAt(0);
            this._(_key).move.from.file = move.slice(1, 2);
            this._(_key).move.from.rank = move.slice(2, 3);
            this._(_key).move.capture = move.slice(3, 4) == 'x' ? true : false;
            this._(_key).move.to.file = this._(_key).move.capture ? move.slice(4, 5) : move.slice(3, 4);
            this._(_key).move.to.rank = this._(_key).move.capture ? move.slice(5, 6) : move.slice(4, 5);

            _updateChessboard(this._);
//console.log(move);
//console.log(this._(_key).move);
        },

    };

    // Returns a init property that returns the "constructor" function.
    return {
        init: _Chess
    }

})();


