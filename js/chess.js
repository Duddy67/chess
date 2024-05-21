
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
        _(_key).MAX_STEPS = 7;
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

    /*
     * Returns a square value (ie: empty or occupied by a piece) at a given position.
     */
    function _getSquare(_, position) {
        const rank = position.charAt(1);
        const file = position.charAt(0);

        return _(_key).chessboard[_(_key).coordinates[rank]][_(_key).coordinates[file]];
    }

    function _getOneStepForward(_, position) {
        let rank = position.charAt(1);
        // One step forward from the white viewpoint.
        if (_(_key).turn == 'w') {
            // Check for boundary effect.
            rank = parseInt(rank) < 8 ? parseInt(rank) + 1 : rank;
        }
        // One step forward from the black viewpoint.
        else {
            rank = parseInt(rank) > 1 ? parseInt(rank) - 1 : rank;
        }

        return position.charAt(0) + rank;
    }

    function _getOneStepBackward(_, position) {
        let rank = position.charAt(1);
        // One step backward from the white viewpoint.
        if (_(_key).turn == 'w') {
            // Check for boundary effect.
            rank = parseInt(rank) > 1 ? parseInt(rank) - 1 : rank;
        }
        // One step backward from the black viewpoint.
        else {
            rank = parseInt(rank) < 8 ? parseInt(rank) + 1 : rank;
        }

        return position.charAt(0) + rank;
    }

    function _getOneStepRight(_, position) {
        let file = position.charAt(0);
        // One step right from the white viewpoint.
        if (_(_key).turn == 'w') {
            // Check for boundary effect.
            file = file.localeCompare('h') === -1 ? String.fromCharCode(file.charCodeAt(0) + 1) : file;
        }
        // One step right from the black viewpoint.
        else {
            file = file.localeCompare('a') === 1 ? String.fromCharCode(file.charCodeAt(0) - 1) : file;
        }

        return file + position.charAt(1);
    }

    function _getOneStepLeft(_, position) {
        let file = position.charAt(0);
        // One step left from the white viewpoint.
        if (_(_key).turn == 'w') {
            // Check for boundary effect.
            file = file.localeCompare('a') === 1 ? String.fromCharCode(file.charCodeAt(0) - 1) : file;
        }
        // One step left from the black viewpoint.
        else {
            file = file.localeCompare('h') === -1 ? String.fromCharCode(file.charCodeAt(0) + 1) : file;
        }

        return file + position.charAt(1);
    }

    /*
     * Returns the possible forward moves from a given position.
     */
    function __getForwardMoves(_, position, steps) {
        // Extract file and rank coordinates from the given position.
        let file = position.charAt(0); 
        let rank = position.charAt(1);
        // Get the number of steps according to the given 'steps' parameter.
        steps = steps === undefined ? _(_key).MAX_STEPS : steps;
        let moves = [];

        // Loop through each step.
        for (let i = 0; i < steps; i++) {
            let previousRank = rank;

            // One step forward from the white viewpoint.
            if (_(_key).turn == 'w') {
                // Check for boundary effect.
                rank = parseInt(rank) < 8 ? parseInt(rank) + 1 : rank;
            }
            // One step forward from the black viewpoint.
            else {
                rank = parseInt(rank) > 1 ? parseInt(rank) - 1 : rank;
            }

            let square = _getSquare(_, file + rank);

            // The rank hasn't changed (ie: boundary effect), or the square is occupied by a friend piece.
            if (rank == previousRank || square.charAt(1) == _(_key).turn) {
                // The piece can't move here.
                break;
            }

            moves.push(file + rank);

            // The square is occupied by an opponent piece (that can possibly be captured). 
            if (square && square.charAt(1) != _(_key).turn) {
                // The piece can't go further.
                break;    
            }
        }

        return moves;
    }

    function _getMoves(_, position, steps, direction) {
        // Extract file and rank coordinates from the given position.
        let file = position.charAt(0); 
        let rank = position.charAt(1);
        // Get the number of steps according to the given 'steps' parameter.
        steps = steps === undefined ? _(_key).MAX_STEPS : steps;
        let moves = [];

        // Loop through each step.
        for (let i = 0; i < steps; i++) {
            let previousPosition = position;

            switch (direction) {
                case 'forward':
                    position = _getOneStepForward(_, position);
                    break;
            }

            let square = _getSquare(_, position);

            // The position hasn't changed (ie: boundary effect), or the square is occupied by a friend piece.
            if (position == previousPosition || square.charAt(1) == _(_key).turn) {
                // The piece can't move here.
                break;
            }

            moves.push(position);

            // The square is occupied by an opponent piece (that can possibly be captured). 
            if (square && square.charAt(1) != _(_key).turn) {
                // The piece can't go further.
                break;    
            }
        }

        return moves;
    }


    function _getForwardMoves(_, position, steps) {
        return _getMoves(_, position, steps, 'forward');
    }

    function _getBackwardMoves(_, position, steps) {
        return _getMoves(_, position, steps, 'backward');
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

        getKingMoves: function(position) {

        },

        getQueenMoves: function(position) {

        },

        getBishopMoves: function(position) {

        },

        getKnightMoves: function(position) {

        },

        getRookMoves: function(position) {

        },

        getPawnMoves: function(position) {
            // Check the number of steps allowed (ie: 2 or 1) according to the pawn rank position.
            let steps = (this._(_key).turn == 'w' && position.charAt(1) == 2) || (this._(_key).turn == 'b' && position.charAt(1) == 7) ? 2 : 1;
            let moves = _getForwardMoves(this._, position, steps);

            for (let i = 0; i < moves.length; i++) {
                if (_getSquare(this._, moves[i])) {
                    moves.pop();
                }
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


