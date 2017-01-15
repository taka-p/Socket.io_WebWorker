var worker = new Worker('worker.js');
var socket = io.connect('http://localhost:8080');

var formEl = document.getElementById('form');
var msgEl = document.getElementById('msg');
var msgList = document.getElementById('msgList');
var matchList = document.getElementById('matchList');


/* web worker */
// 初期化
window.onload = function() {
    worker.postMessage({
    type: 'INIT_USER'
  });
};

// 入力したら該当ユーザーを表示
msgEl.onkeyup = function(e) {
  while(matchList.firstChild) {
    matchList.removeChild(matchList.firstChild)
  }

  // workerに入力値を送信
  if (e.currentTarget.value) {
    worker.postMessage({
      type: 'INPUT_USER',
      payload: e.currentTarget.value
    });
  }
}

// workerからmessageイベントを受け取ったらリストに追加
worker.onmessage = function(e) {
  console.log(
    'メインスレッド'
  );

  if (e.data.type === 'INIT_USER') {
    console.log(e.data.payload);
    if (e.data.payload.length > 0) {
      var userList = e.data.payload;
      userList.forEach(function(user, idx) {
        var item = document.createElement('li');
        item.appendChild(document.createTextNode(user.name));
        item.setAttribute('data-user-id', user._id);
        item.onclick = function () {
          msgEl.value = user.name;
        };
        msgList.appendChild(item);
      });
    }
  } else if (e.data.type === 'INPUT_USER') {
    var userList = e.data.payload;
    userList.forEach(function(user, idx) {
      var item = document.createElement('li');
      item.appendChild(document.createTextNode(user.name));
      item.setAttribute('data-user-id', idx+1);
      item.onclick = function () {
        msgEl.value = user.name;
      };
      matchList.appendChild(item);
    });
  }
};


/* socket.io */
// サーバーにmsgを送信
formEl.onsubmit = function(e) {
  e.preventDefault();
  if (msgEl.value) {
      socket.emit('ADD_USER', msgEl.value);
      msgEl.value = '';
  }
};

// サーバーからmsgイベントを受け取ったらリストに追加
socket.on('ADD_USER_FINISH', function(msg){
  var item = document.createElement('li');
  item.appendChild(document.createTextNode(msg));
  msgList.appendChild(item);
});
