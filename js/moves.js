
/*
 * Returns the ending position after one step on the board in a specific direction.
 */
function stepable (chessboard, side) {

    return {
        /*
         * Returns the coordinates of a step forward went from the piece position.
         * If a boundary effect is detected, the piece position is returned.
         */
        goOneStepForward: (position) => {
            // Extract rank coordinates from the position.
            let rank = position.charAt(1);

            // One step forward from the white viewpoint.
            if (side == 'w') {
                // Check for boundary effect.
                rank = parseInt(rank) < chessboard.getMaxSquares() ? parseInt(rank) + 1 : rank;
            }
            // One step forward from the black viewpoint.
            else {
                // Check for boundary effect.
                rank = parseInt(rank) > 1 ? parseInt(rank) - 1 : rank;
            }

            return position.charAt(0) + rank;
        },

        /*
         * Returns the coordinates of a step backward went from a given position.
         * If a boundary effect is detected, the given position is returned.
         */
        goOneStepBackward: (position) => {
            // Extract rank coordinates from the given position.
            let rank = position.charAt(1);

            // One step backward from the white viewpoint.
            if (side == 'w') {
                // Check for boundary effect.
                rank = parseInt(rank) > 1 ? parseInt(rank) - 1 : rank;
            }
            // One step backward from the black viewpoint.
            else {
                // Check for boundary effect.
                rank = parseInt(rank) < chessboard.getMaxSquares() ? parseInt(rank) + 1 : rank;
            }

            return position.charAt(0) + rank;
        },

        /*
         * Returns the coordinates of a step right went from a given position.
         * If a boundary effect is detected, the given position is returned.
         */
        goOneStepRight: (position) =>  {
            // Extract file coordinates from the given position.
            let file = position.charAt(0);

            // One step right from the white viewpoint.
            if (side == 'w') {
                // Check for boundary effect.
                file = file.localeCompare('h') === -1 ? String.fromCharCode(file.charCodeAt(0) + 1) : file;
            }
            // One step right from the black viewpoint.
            else {
                // Check for boundary effect.
                file = file.localeCompare('a') === 1 ? String.fromCharCode(file.charCodeAt(0) - 1) : file;
            }

            return file + position.charAt(1);
        },

        /*
         * Returns the coordinates of a step left went from a given position.
         * If a boundary effect is detected, the given position is returned.
         */
        goOneStepLeft: (position) => {
            // Extract file coordinates from the given position.
            let file = position.charAt(0);

            // One step left from the white viewpoint.
            if (side == 'w') {
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
    };
}

/*
 * Returns the possible moves on the board in a specific direction for a given number of steps.
 */
function movable (chessboard, side) {
    const step = stepable(chessboard, side);

    return {
        getMoves: (position, steps, direction) => {
            // Get the number of steps according to the given 'steps' parameter.
            steps = steps === undefined ? chessboard.getMaxSteps() : steps;
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
                        position = step.goOneStepForward(position);
                        break;

                    case 'backward':
                        position = step.goOneStepBackward(position);
                        break;

                    case 'right':
                        position = step.goOneStepRight(position);
                        break;

                    case 'left':
                        position = step.goOneStepLeft(position);
                        break;

                    case 'right-diagonal-forward':
                        // First go one step forward.
                        position = step.goOneStepForward(position);

                        // Check for boundary effect.
                        if (position == previousPosition) {
                            break
                        }

                        forward = position;

                        // Then go one step right to get the diagonal direction.
                        position = step.goOneStepRight(position);

                        // Check again for boundary effect.
                        if (position == forward) {
                            position = previousPosition;
                        }

                        break;

                    case 'left-diagonal-forward':
                        // First go one step forward.
                        position = step.goOneStepForward(position);

                        // Check for boundary effect.
                        if (position == previousPosition) {
                            break
                        }

                        forward = position;

                        // Then go one step left to get the diagonal direction.
                        position = step.goOneStepLeft(position);

                        // Check again for boundary effect.
                        if (position == forward) {
                            position = previousPosition;
                        }

                        break;

                    case 'right-diagonal-backward':
                        // First go one step backward.
                        position = step.goOneStepBackward(position);

                        // Check for boundary effect.
                        if (position == previousPosition) {
                            break
                        }

                        backward = position;

                        // Then go one step right to get the diagonal direction.
                        position = step.goOneStepRight(position);

                        // Check again for boundary effect.
                        if (position == backward) {
                            position = previousPosition;
                        }

                        break;

                    case 'left-diagonal-backward':
                        // First go one step backward.
                        position = step.goOneStepBackward(position);

                        // Check for boundary effect.
                        if (position == previousPosition) {
                            break
                        }

                        backward = position;

                        // Then go one step left to get the diagonal direction.
                        position = step.goOneStepLeft(position);

                        // Check again for boundary effect.
                        if (position == backward) {
                            position = previousPosition;
                        }

                        break;
                }

                let square = chessboard.getSquare(position);

                // The position hasn't changed (ie: boundary effect), or the square is occupied by a friend piece.
                if (position == previousPosition || square.charAt(1) == side) {
                    // The piece can't move here.
                    break;
                }

                moves.push(position);

                // The square is occupied by an opponent piece (that can possibly be captured). 
                if (square && square.charAt(1) != side) {
                    // The piece can't go further.
                    break;    
                }
            }

            return moves;
        }
    };
}

class Movable {
    #chessboard;
    #side;
    #stepable;

    constructor(chessboard, side) {
        this.#chessboard = chessboard;
        this.#side = side;
        this.#stepable = stepable(chessboard, side);
    }

    getMoves(position, steps, direction) {
        // Get the number of steps according to the given 'steps' parameter.
        steps = steps === undefined ? this.#chessboard.getMaxSteps() : steps;
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
                    position = this.#stepable.goOneStepForward(position);
                    break;

                case 'backward':
                    position = this.#stepable.goOneStepBackward(position);
                    break;

                case 'right':
                    position = this.#stepable.goOneStepRight(position);
                    break;

                case 'left':
                    position = this.#stepable.goOneStepLeft(position);
                    break;

                case 'right-diagonal-forward':
                    // First go one step forward.
                    position = this.#stepable.goOneStepForward(position);

                    // Check for boundary effect.
                    if (position == previousPosition) {
                        break
                    }

                    forward = position;

                    // Then go one step right to get the diagonal direction.
                    position = this.#stepable.goOneStepRight(position);

                    // Check again for boundary effect.
                    if (position == forward) {
                        position = previousPosition;
                    }

                    break;

                case 'left-diagonal-forward':
                    // First go one step forward.
                    position = this.#stepable.goOneStepForward(position);

                    // Check for boundary effect.
                    if (position == previousPosition) {
                        break
                    }

                    forward = position;

                    // Then go one step left to get the diagonal direction.
                    position = this.#stepable.goOneStepLeft(position);

                    // Check again for boundary effect.
                    if (position == forward) {
                        position = previousPosition;
                    }

                    break;

                case 'right-diagonal-backward':
                    // First go one step backward.
                    position = this.#stepable.goOneStepBackward(position);

                    // Check for boundary effect.
                    if (position == previousPosition) {
                        break
                    }

                    backward = position;

                    // Then go one step right to get the diagonal direction.
                    position = this.#stepable.goOneStepRight(position);

                    // Check again for boundary effect.
                    if (position == backward) {
                        position = previousPosition;
                    }

                    break;

                case 'left-diagonal-backward':
                    // First go one step backward.
                    position = this.#stepable.goOneStepBackward(position);

                    // Check for boundary effect.
                    if (position == previousPosition) {
                        break
                    }

                    backward = position;

                    // Then go one step left to get the diagonal direction.
                    position = this.#stepable.goOneStepLeft(position);

                    // Check again for boundary effect.
                    if (position == backward) {
                        position = previousPosition;
                    }

                    break;
            }

            let square = this.#chessboard.getSquare(position);

            // The position hasn't changed (ie: boundary effect), or the square is occupied by a friend piece.
            if (position == previousPosition || square.charAt(1) == this.#side) {
                // The piece can't move here.
                break;
            }

            moves.push(position);

            // The square is occupied by an opponent piece (that can possibly be captured). 
            if (square && square.charAt(1) != this.#side) {
                // The piece can't go further.
                break;    
            }
        }

        return moves;
    }
}
