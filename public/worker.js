// 処理中断用タイマー
var timer = null;

// メインスレッドから受信
self.onmessage = function(e) {
  if (e.data.type === 'INIT_USER') {
    initUser();
  } else if (e.data.type === 'INPUT_USER') {
    inputUser(e.data.payload);
  }
};

function initUser() {
  console.log(
    'wokerスレッド',
    'IINIT_USER'
  );

  // apiからユーザー一覧を取得
  var xhr = new XMLHttpRequest();
  xhr.open(
    'GET',
    '/api/myusers',
    true
  );
  xhr.send(null);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 &&
        xhr.status === 200) {
      var userList = JSON.parse(xhr.responseText);

      // メインスレッドに送信
      self.postMessage({
        type: 'INIT_USER',
        payload: userList
      });
    }
  };
}

function inputUser(input) {
  // 繰り返し処理を中断
  clearInterval(timer);

  console.log(
    'wokerスレッド',
    'INPUT_USER'
  );

  // 繰り返し処理開始
  timer = setInterval(function() {
    // apiからユーザー一覧を取得
    var xhr = new XMLHttpRequest();
    xhr.open(
      'GET',
      '/api/users',
      true
    );
    xhr.send(null);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 &&
          xhr.status === 200) {
        var userList = JSON.parse(xhr.responseText);
        var reg = new RegExp(input, 'i');
        var tmp = [].concat(userList);
        var result = [];

        // dbのユーザーと比較したリストを返す
        result = tmp.filter(function(user, idx) {
            return reg.test(user.name);
        });

        // メインスレッドに送信
        self.postMessage({
          type: 'INPUT_USER',
          payload: result
        });

        // 繰り返し処理を終了
        clearInterval(timer);
      }
    };
  }, 0);
}
