const Express = require('express')();
const Http = require('http').Server(Express);
const Socketio = require('socket.io')(Http, {
    cors: {
        origin: '*',
    }
});

const PORT = process.env.PORT || 5000;

let gameStartingSituation = {
    state: false,
    stonePositions: [],
    wallPositions: []
};
let gameOver = {
    playerID: null,
    state: false
}
let playersID = [];

function randomLaying(numberOfStones, maxLimit) {
    let positions = [];
    let randomNumber;
    do {
        randomNumber = Math.floor(Math.random() * maxLimit);
        if (
            positions.indexOf(randomNumber) === -1 &&
            gameStartingSituation.wallPositions.indexOf(randomNumber) === -1
        )
            positions.push(randomNumber);
    } while (positions.length != numberOfStones);
    return positions;
}

Socketio.on('connection', socket => {
    socket.emit('gameStartingSituation', gameStartingSituation);

    socket.emit('ready', playersID);
    socket.on('ready', playerID => {
        if (playersID.indexOf(playerID) === -1) {
            playersID.push(playerID);
            if (playersID.length === 2) {
                gameStartingSituation.state = true;
                gameStartingSituation.wallPositions = randomLaying(8, 81);
                gameStartingSituation.stonePositions = randomLaying(2, 81);
                Socketio.sockets.emit('gameStartingSituation', gameStartingSituation);
            }

        }
        Socketio.sockets.emit('ready', playersID);
        console.log(playersID);
    });

    socket.emit('gameOver', gameOver);
    socket.on('gameOver', playersID => {
        playersID = [];
        gameStartingSituation.state = false
        gameOver.playerID = playersID;
        gameOver.state = true;
        Socketio.sockets.emit('gameOver', gameOver);
    });
});

Http.listen(PORT, () => {
    console.log('Ready on http://localhost:' + PORT);
});