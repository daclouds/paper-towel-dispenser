$(function () {
  var socket = io();
  $('form').submit(function(){
    socket.emit('message', $('#m').val());
    $('#m').val('');
    return false;
  });
  socket.on('message', function(msg){
    const json = JSON.parse(msg);
    console.log(json);
    $('#restroom .rest').text(`잔량 ${json.rest} %`);

    $('#messages').append($('<li>').text(`사용량 ${json.use}cm`));
    window.scrollTo(0, document.body.scrollHeight);
  });
});