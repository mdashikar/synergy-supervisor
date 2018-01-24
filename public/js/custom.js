$(function () {
    var socket = io();

    $('#sendList').submit( function(){
        var content = $('#list').val();
        socket.emit('list', {content:content});

        $('#list').val('');
        return false;
    });
    socket.on('incommingList',function(data){
       console.log(data);
       var html = '';
       html += ' <div class="row lists" ><div class="col-md-4"></div><div class="col-md-8"><h4>'+ data.data.content +'</h4></div></div>' ;

       $('#lists').before(html);
    });
});
