
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
        // Used to determine whose turn is it (white or black). Starts with white.
        _(_key).side = 'w'; 
        // A 2 dimensional array which stores the piece positions on the chessboard.
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
        // Maps between the chess ranks and files and the 2 dimensional array indexes.
        _(_key).coordinates = {'a': 0, 'b': 1, 'c': 2, 'd': 3, 'e': 4, 'f': 5, 'g': 6, 'h': 7,
                               '1': 7, '2': 6, '3': 5, '4': 4, '5': 3, '6': 2, '7': 1, '8': 0}
        // The move object that stores the starting and ending positions of a piece plus extra data regarding the move. 
        _(_key).move = {'from': {'rank': '', 'file': ''}, 'to': {'rank': '', 'file': ''}, 'piece': '', 'capture': false};
        _(_key).history = [];
        _(_key).isPawnPromoted = false;
        // The maximum steps a piece can go on the chessboard.
        _(_key).MAX_STEPS = 7;
        // The maximum number of squares a rank, a file or a diagonal can have.
        _(_key).MAX_SQUARES = 8;
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
     * Returns the value of a square (ie: empty or occupied by a piece) at a given position.
     */
    function _getSquare(_, position) {
        const rank = position.charAt(1);
        const file = position.charAt(0);

        return _(_key).chessboard[_(_key).coordinates[rank]][_(_key).coordinates[file]];
    }

    function _switchSides(_) {
        _(_key).side = _(_key).side == 'w' ? 'b' : 'w';
    }

    function _whoseTurnIsIt(_) {
        return _(_key).side;
    }

    function _setHistory(_) {
        const move = _(_key).move;
        const capture = move.capture === true ? 'x' : '';
        // Store the current move as well as the current state of the chessboard.
        const history = { 
            'move': move.piece + move.from.file + move.from.rank + capture + move.to.file + move.to.rank,
            'chessboard':  _(_key).chessboard
        };
        
        _(_key).history.push(history);
    }

    /*
     * Returns the coordinates of a step forward went from a given position.
     * If a boundary effect is detected, the given position is returned.
     */
    function _goOneStepForward(_, position) {
        // Extract rank coordinates from the given position.
        let rank = position.charAt(1);

        // One step forward from the white viewpoint.
        if (_(_key).side == 'w') {
            // Check for boundary effect.
            rank = parseInt(rank) < _(_key).MAX_SQUARES ? parseInt(rank) + 1 : rank;
        }
        // One step forward from the black viewpoint.
        else {
            // Check for boundary effect.
            rank = parseInt(rank) > 1 ? parseInt(rank) - 1 : rank;
        }

        return position.charAt(0) + rank;
    }

    /*
     * Returns the coordinates of a step backward went from a given position.
     * If a boundary effect is detected, the given position is returned.
     */
    function _goOneStepBackward(_, position) {
        // Extract rank coordinates from the given position.
        let rank = position.charAt(1);

        // One step backward from the white viewpoint.
        if (_(_key).side == 'w') {
            // Check for boundary effect.
            rank = parseInt(rank) > 1 ? parseInt(rank) - 1 : rank;
        }
        // One step backward from the black viewpoint.
        else {
            // Check for boundary effect.
            rank = parseInt(rank) < _(_key).MAX_SQUARES ? parseInt(rank) + 1 : rank;
        }

        return position.charAt(0) + rank;
    }

    /*
     * Returns the coordinates of a step right went from a given position.
     * If a boundary effect is detected, the given position is returned.
     */
    function _goOneStepRight(_, position) {
        // Extract file coordinates from the given position.
        let file = position.charAt(0);

        // One step right from the white viewpoint.
        if (_(_key).side == 'w') {
            // Check for boundary effect.
            file = file.localeCompare('h') === -1 ? String.fromCharCode(file.charCodeAt(0) + 1) : file;
        }
        // One step right from the black viewpoint.
        else {
            // Check for boundary effect.
            file = file.localeCompare('a') === 1 ? String.fromCharCode(file.charCodeAt(0) - 1) : file;
        }

        return file + position.charAt(1);
    }

    /*
     * Returns the coordinates of a step left went from a given position.
     * If a boundary effect is detected, the given position is returned.
     */
    function _goOneStepLeft(_, position) {
        // Extract file coordinates from the given position.
        let file = position.charAt(0);

        // One step left from the white viewpoint.
        if (_(_key).side == 'w') {
            // Check for boundary effect.
            file = file.localeCompare('a') === 1 ? String.fromCharCode(file.charCodeAt(0) - 1) : file;
        }
        // One step left from the black viewpoint.
        else {
            // Check for boundary effect.
            file = file.localeCompare('h') === -1 ? String.fromCharCode(file.charCodeAt(0) + 1) : file;
        }

        return file + position.charAt(1);
    }

    /*
     * Returns the coordinates of two steps went from a given position in a given direction.
     * If a boundary effect is detected, the given position is returned.
     * N.B: This function is only used for knight pieces due to their specific moves.
     */
    function _goTwoSteps(_, position, direction) {
        const initialPosition = position;
        const functionName = '_goOneStep' + direction; 

        for (let i = 0; i < 2; i++) {
            let previousPosition = position;
            // N.B: Using eval is not risky here as it's called inside the Chess anonymous 
            //      function scope. Thus, no one can modify the eval argument from the outside.
            position = eval(`${functionName}(_, position)`);

            if (position == previousPosition) {
                return initialPosition;
            }
        }

        return position;
    }

    /*
     * Returns the possible moves from a given position to a given direction.
     */
    function _getMoves(_, position, steps, direction) {
        // Get the number of steps according to the given 'steps' parameter.
        steps = steps === undefined ? _(_key).MAX_STEPS : steps;
        let moves = [];
        // Temporary variables needed for diagonals.
        let forward = '';
        let backward = '';

        // Loop through each step.
        for (let i = 0; i < steps; i++) {
            let previousPosition = position;

            // Go one step in the given direction.
            switch (direction) {
                case 'forward':
                    position = _goOneStepForward(_, position);
                    break;

                case 'backward':
                    position = _goOneStepBackward(_, position);
                    break;

                case 'right':
                    position = _goOneStepRight(_, position);
                    break;

                case 'left':
                    position = _goOneStepLeft(_, position);
                    break;

                case 'right-diagonal-forward':
                    // First go one step forward.
                    position = _goOneStepForward(_, position);

                    // Check for boundary effect.
                    if (position == previousPosition) {
                        break
                    }

                    forward = position;

                    // Then go one step right to get the diagonal direction.
                    position = _goOneStepRight(_, position);

                    // Check again for boundary effect.
                    if (position == forward) {
                        position = previousPosition;
                    }

                    break;

                case 'left-diagonal-forward':
                    // First go one step forward.
                    position = _goOneStepForward(_, position);

                    // Check for boundary effect.
                    if (position == previousPosition) {
                        break
                    }

                    forward = position;

                    // Then go one step left to get the diagonal direction.
                    position = _goOneStepLeft(_, position);

                    // Check again for boundary effect.
                    if (position == forward) {
                        position = previousPosition;
                    }

                    break;

                case 'right-diagonal-backward':
                    // First go one step backward.
                    position = _goOneStepBackward(_, position);

                    // Check for boundary effect.
                    if (position == previousPosition) {
                        break
                    }

                    backward = position;

                    // Then go one step right to get the diagonal direction.
                    position = _goOneStepRight(_, position);

                    // Check again for boundary effect.
                    if (position == backward) {
                        position = previousPosition;
                    }

                    break;

                case 'left-diagonal-backward':
                    // First go one step backward.
                    position = _goOneStepBackward(_, position);

                    // Check for boundary effect.
                    if (position == previousPosition) {
                        break
                    }

                    backward = position;

                    // Then go one step left to get the diagonal direction.
                    position = _goOneStepLeft(_, position);

                    // Check again for boundary effect.
                    if (position == backward) {
                        position = previousPosition;
                    }

                    break;
            }

            let square = _getSquare(_, position);

            // The position hasn't changed (ie: boundary effect), or the square is occupied by a friend piece.
            if (position == previousPosition || square.charAt(1) == _(_key).side) {
                // The piece can't move here.
                break;
            }

            moves.push(position);

            // The square is occupied by an opponent piece (that can possibly be captured). 
            if (square && square.charAt(1) != _(_key).side) {
                // The piece can't go further.
                break;    
            }
        }

        return moves;
    }

    // Functions that return the possible moves in a specific direction.

    function _getForwardMoves(_, position, steps) {
        return _getMoves(_, position, steps, 'forward');
    }

    function _getBackwardMoves(_, position, steps) {
        return _getMoves(_, position, steps, 'backward');
    }

    function _getRightMoves(_, position, steps) {
        return _getMoves(_, position, steps, 'right');
    }

    function _getLeftMoves(_, position, steps) {
        return _getMoves(_, position, steps, 'left');
    }

    function _getRightDiagonalForwardMoves(_, position, steps) {
        return _getMoves(_, position, steps, 'right-diagonal-forward');
    }

    function _getLeftDiagonalForwardMoves(_, position, steps) {
        return _getMoves(_, position, steps, 'left-diagonal-forward');
    }

    function _getRightDiagonalBackwardMoves(_, position, steps) {
        return _getMoves(_, position, steps, 'right-diagonal-backward');
    }

    function _getLeftDiagonalBackwardMoves(_, position, steps) {
        return _getMoves(_, position, steps, 'left-diagonal-backward');
    }

    // Functions dedicated to the knight specific moves.

    function _getKnightForwardMoves(_, position, direction) {
        const initialPosition = position;
        let moves = [];
        let forwardPosition = _goTwoSteps(_, position, 'Forward');

        // No boundary effect.
        if (forwardPosition != position) {
            const functionName = '_goOneStep' + direction;
            position = eval(`${functionName}(_, forwardPosition)`);

            // No boundary effect.
            if (position != forwardPosition) {
                moves.push(position);
            }
        }

        forwardPosition = _goOneStepForward(_, initialPosition);

        // No boundary effect.
        if (forwardPosition != initialPosition) {
            position = _goTwoSteps(_, forwardPosition, direction);

            // No boundary effect.
            if (position != forwardPosition) {
                moves.push(position);
            }
        }

        return moves;
    }

    function _getKnightBackwardMoves(_, position, direction) {
        const initialPosition = position;
        let moves = [];
        let backwardPosition = _goTwoSteps(_, position, 'Backward');

        // No boundary effect.
        if (backwardPosition != position) {
            const functionName = '_goOneStep' + direction;
            position = eval(`${functionName}(_, backwardPosition)`);

            // No boundary effect.
            if (position != backwardPosition) {
                moves.push(position);
            }
        }

        backwardPosition = _goOneStepBackward(_, initialPosition);

        // No boundary effect.
        if (backwardPosition != initialPosition) {
            position = _goTwoSteps(_, backwardPosition, direction);

            // No boundary effect.
            if (position != backwardPosition) {
                moves.push(position);
            }
        }

        return moves;
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

        whoseTurnIsIt: function() {
            return _whoseTurnIsIt(this._);
        },

        getSquare: function(position) {
            return _getSquare(this._, position);
        },

        // Functions that return the all possible moves for each piece.

        getKingMoves: function(position) {
            const step = 1;
            let moves = [];

            return moves.concat(_getForwardMoves(this._, position, step), 
                                _getBackwardMoves(this._, position, step),
                                _getRightMoves(this._, position, step),
                                _getLeftMoves(this._, position, step),
                                _getRightDiagonalForwardMoves(this._, position, step),
                                _getLeftDiagonalForwardMoves(this._, position, step),
                                _getRightDiagonalBackwardMoves(this._, position, step),
                                _getLeftDiagonalBackwardMoves(this._, position, step)
            );
        },

        getQueenMoves: function(position) {
            let moves = [];

            return moves.concat(_getForwardMoves(this._, position), 
                                _getBackwardMoves(this._, position),
                                _getRightMoves(this._, position),
                                _getLeftMoves(this._, position),
                                _getRightDiagonalForwardMoves(this._, position),
                                _getLeftDiagonalForwardMoves(this._, position),
                                _getRightDiagonalBackwardMoves(this._, position),
                                _getLeftDiagonalBackwardMoves(this._, position)
            );
        },

        getBishopMoves: function(position) {
            let moves = [];

            return moves.concat(_getRightDiagonalForwardMoves(this._, position),
                                _getLeftDiagonalForwardMoves(this._, position),
                                _getRightDiagonalBackwardMoves(this._, position),
                                _getLeftDiagonalBackwardMoves(this._, position)
            );
        },

        getKnightMoves: function(position) {
            let moves = [];

            moves = moves.concat(_getKnightForwardMoves(this._, position, 'Left'),
                                 _getKnightForwardMoves(this._, position, 'Right'),
                                 _getKnightBackwardMoves(this._, position, 'Left'),
                                 _getKnightBackwardMoves(this._, position, 'Right')
            );

            for (let i = 0; i < moves.length; i++) {
                let square = _getSquare(this._, moves[i]);

                // The square is occupied by a friend piece.
                if (square.charAt(1) == this._(_key).side) {
                    //console.log(square + moves[i]);
                    // The knight can't move here.
                    moves.splice(i, 1);
                }
            }

            return moves;
        },

        getRookMoves: function(position) {
            let moves = [];

            return moves.concat(_getForwardMoves(this._, position), 
                                _getBackwardMoves(this._, position),
                                _getRightMoves(this._, position),
                                _getLeftMoves(this._, position)
            );
        },

        getPawnMoves: function(position) {
            // Check the number of steps allowed (ie: 2 or 1) according to the pawn rank position.
            let steps = (this._(_key).side == 'w' && position.charAt(1) == 2) || (this._(_key).side == 'b' && position.charAt(1) == 7) ? 2 : 1;
            let moves = _getForwardMoves(this._, position, steps);

            // Check for any opponent piece in the way.
            for (let i = 0; i < moves.length; i++) {
                // There is an opponent piece.
                if (_getSquare(this._, moves[i])) {
                    // The pawn can't go there.
                    moves.splice(i, 1);
                }
            }

            // Check for possible opponent pieces to capture diagonally.

            const forward = _goOneStepForward(this._, position);

            if (forward != position) {
                position = _goOneStepRight(this._, forward);

                if (position != forward && _getSquare(this._, position)) {
                    moves.push(position);
                }

                position = _goOneStepLeft(this._, forward);

                if (position != forward && _getSquare(this._, position)) {
                    moves.push(position);
                }
            }

            // Check for pawn promotion.
            if (moves.length) {
                moves.forEach((move) => {
                    // A white pawn can move up somewhere to the 8th rank.
                    if (this._(_key).side == 'w' && /[a-h]8/.test(move)) {
                        this._(_key).isPawnPromoted = true;
                console.log('promotion white');
                    }

                    // A black pawn can move down somewhere to the first rank.
                    if (this._(_key).side == 'b' && /[a-h]1/.test(move)) {
                        this._(_key).isPawnPromoted = true;
                console.log('promotion black');
                    }
                });
            }

            // TODO Check for the "en passant" move.

            return moves;
        },

        /*setMove: function(move) {

            // The UCI protocol doesn't use any abbreviation for pawns.
            if (!/^[A-Z]/.test(move)) {
                move = 'P' + move;
            }

            this._(_key).move.piece = move.charAt(0);
            this._(_key).move.from.file = move.slice(1, 2);
            this._(_key).move.from.rank = move.slice(2, 3);
            this._(_key).move.capture = move.slice(3, 4) == 'x' ? true : false;
            this._(_key).move.to.file = this._(_key).move.capture ? move.slice(4, 5) : move.slice(3, 4);
            this._(_key).move.to.rank = this._(_key).move.capture ? move.slice(5, 6) : move.slice(4, 5);

            //_updateChessboard(this._);
        },*/

        setMoveFrom: function(from, piece) {
            this._(_key).move.piece = piece;
            this._(_key).move.from.file = from.charAt(0);
            this._(_key).move.from.rank = from.charAt(1);
        },

        /*
         * Empties the move object.
         */
        resetMove: function() {
            this._(_key).move.piece = '';
            this._(_key).move.from.file = '';
            this._(_key).move.from.rank = '';
            this._(_key).move.capture = false;
            this._(_key).move.to.file = '';
            this._(_key).move.to.rank = '';
            // 
            this._(_key).isPawnPromoted = false;
        },

        getMoveFrom: function() {
            return this._(_key).move.from.file ? {'file': this._(_key).move.from.file, 'rank': this._(_key).move.from.rank} : {};
        },

        playMove: function(moveTo, pawnPromotionPiece) {
            this._(_key).move.to.file = moveTo.charAt(0);
            this._(_key).move.to.rank = moveTo.charAt(1);

            if (_getSquare(this._, moveTo.charAt(0) + moveTo.charAt(1))) {
                this._(_key).move.capture = true;
            }

            // Check for promoted pawn.
            if (pawnPromotionPiece !== undefined) {
                // Replace the promoted pawn by the selected piece.
                this._(_key).move.piece = pawnPromotionPiece;
            }

            _updateChessboard(this._);

            _setHistory(this._);
            this.resetMove();

            _switchSides(this._);
        },

        updateChessboard: function() {
            const coordinates = this._(_key).coordinates;
            const move = this._(_key).move;
            // Get the piece color (ie: the second letter of the string). 
            const color = this._(_key).chessboard[coordinates[move.from.rank]][coordinates[move.from.file]].slice(1, 2);

            // Update the piece position on the chessboard.
            this._(_key).chessboard[coordinates[move.from.rank]][coordinates[move.from.file]] = '';
            this._(_key).chessboard[coordinates[move.to.rank]][coordinates[move.to.file]] = move.piece + color;
        },

        isPawnPromoted: function() {
           return this._(_key).isPawnPromoted;
        },

        getHistory: function() {
           return this._(_key).history;
        },

        isObjectEmpty: function(value) {
            return value && Object.keys(value).length === 0;
        },

        isObjectNotEmpty: function(value) {
            return value && Object.keys(value).length !== 0;
        },
    };

    // Returns a init property that returns the "constructor" function.
    return {
        init: _Chess
    }
})();


