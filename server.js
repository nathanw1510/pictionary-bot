const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(bodyParser.json());

var games = new Map();
var links = [...games.keys()];
games.set('/a', []);

app.post('/add', (req, res) => {
    let link = req.body.link;
    games.set(`/${link}`, []);
    res.send(link);
});

app.post('/remove', (req, res) => {
    let link = `/${req.body.link}`;
    games.delete(link);
    res.send(link);
})

app.get(links, (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/update', (req, res) => {
    let link = `/${req.body.link}`;
    if(games.get(link).length == 0){
        res.send('Empty');
    }else{
        res.send(games.get(link));
    }
});

io.sockets.on('connection', (socket) => {
    socket.on('mouse', (data) => {
        let link = data.link.split('https://')[1].split('/')[1];
        if(games.has(`/${link}`)){
            let game = games.get(`/${link}`);
            game.push({
                x: data.x,
                y: data.y,
                px: data.px,
                py: data.py,
                strokeweight: data.strokeweight,
                color: data.color
            });
        }
    }); 
});

setInterval(()=>{
    links = [...games.keys()];
}, 10);

server.listen(3000);