var express = require('express');
var app = express();
var io = require('socket.io').listen(8080);
var mongoose = require('mongoose');

app.use(express.static(__dirname + '/public'));

mongoose.connect('mongodb://localhost/mydb');
var Schema = mongoose.Schema;
var User = mongoose.model('users', new Schema({
  name: String
}));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/api/users', function(req, res) {
  var json = require(__dirname + '/db/users.json');
  res.json(json);
});

app.get('/api/myusers', function(req, res) {
  var users = User.find({}, function(err, docs) {
    if (err) {
      throw err;
    } else {
      res.json(docs);
    }
  });
});

// クライアントとのsocket.ioが接続
io.on('connection', function(socket) {
  // クライアントからのメーセージを受信（socket.io）
  socket.on('ADD_USER', function(addUser) {
    // dbに追加
    var user = new User();
    user.name = addUser;
    user.save(function(err) {
        if (err)  {
          throw err;
        } else {
          // クライアントに追加ユーザーを返す
          io.emit('ADD_USER_FINISH', addUser);
          console.log(
            '追加完了: ' ,
            addUser
          );
        }
    });
  });
});

app.listen(3001, function(){
  console.log('listening on *:3001');
});
