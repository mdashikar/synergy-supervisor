const async = require('async');
const Supervisor = require('../models/supervisor');

module.exports = function(io){
    io.on('connection', function(socket){
        console.log('Connected');
        var user = socket.request.user;
        console.log(user);
   

        socket.on('list', (data)=> {
            async.parallel([
                function(callback){
                    io.emit('incommingList', {data, user});
                },
                function(callback){
                    async.waterfall([
                        function(callback){
                            var list = new List();
                            list.content = data.content;
                            list.owner = user._id;
                            list.save(function(err){
                                callback(err, list);
                            }) 
                        },
                        function(list, callback){
                            User.update({
                                _id : user._id
                            },
                            {
                                $push: {boards:{ list: list._id}},
                            }, function(err, count){
                                callback(err, count);
                            }
                        )
                        }
                    ]);
                }
            ]);
            
        });
    });
}