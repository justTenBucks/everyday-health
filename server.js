const express = require('express');
const app = express();
const flash = require('connect-flash');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
const MongoClient = require('mongodb').MongoClient;
app.set('view engine', 'ejs');
app.use('/public', express.static('public'));
const methodOverride = require('method-override')
app.use(methodOverride('_method'))
const bcryptjs = require('bcryptjs');
app.use(flash());

const passport = require('passport')
const Localstrategy = require('passport-local').Strategy
const session = require('express-session')

app.use(session({secret : '비밀코드', resave : true, saveUninitialized : false}));
app.use(passport.initialize());
app.use(passport.session());


MongoClient.connect('mongodb+srv://oneforthe:moneyand@cluster0.9dccx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', function (err, client) {
    if (err) return console.log(err)

    db = client.db('todoapp')

    app.listen(8080, function () {
        console.log('listening on 8080')
    });
});


app.get('/write', function (req, res) {
    // res.send('뷰티 용품 쇼핑 페이지입니다');
    res.render('write.ejs', {})

});

app.get('/list', function (req, res) {
    db.collection('post').find().toArray(function (err, data) {
        console.log(data);
        res.render('list.ejs', { posts: data });
    });

});

app.post('/add', function (req, res) {
    // res.send('전송완료')
    console.log(req.body.date)
    console.log(req.body.title)
    db.collection('counter').findOne({ name: '게시물갯수' }, function (err, res2) {
        console.log(res2.totalPost)
        var 총게시물갯수 = res2.totalPost
        db.collection('post').insertOne({ _id: 총게시물갯수 + 1, 제목: req.body.title, 날짜: req.body.date }, function (err, res) {
            console.log('저장완료');
            db.collection('counter').updateOne({ name: '게시물갯수' }, { $inc: { totalPost: 1 } }, function (err, res) {
                if (err) { return console.log(에러) }
            
            })
        });
    res.redirect('/write')
    });
});


app.delete('/delete', function (req, resp) {
    console.log(req.body)
    req.body._id = parseInt(req.body._id);
    db.collection('post').deleteOne(req.body, function (err, res) {
        resp.status(200).send({ message: 'success' });
    });
});


app.get('/detail/:id', function (req, resp) {
    db.collection('post').findOne({ _id: parseInt(req.params.id) }, function (err, res) {
        console.log(res)
        resp.render('detail.ejs', { data: res })
    })

})

app.get('/edit/:id', function(req,resp){
    db.collection('post').findOne({ _id: parseInt(req.params.id) }, function (err, res) {
        console.log(res)
        resp.render('edit.ejs', { data: res })

    })
})

app.put('/edit', function(req,resp){
    db.collection('post').updateOne({_id : parseInt(req.body.id)}, 
    { $set : { 제목 : req.body.title, 날짜 : req.body.date} }, function(err,res){
        console.log('수정완료')
        resp.redirect('/list')
    })
});

app.get('/register', loadLoginData, function (req, res) {
    res.render('register.ejs', {user: req.user.id});
});



app.post('/register', function (req, res) {
    // res.send('전송완료')
    let encryptedPassword = '';
    bcryptjs.hash(String(req.body.pw), 10, function(err, hash){
        encryptedPassword = hash;
        db.collection('counter').findOne({name : 'totalMember'}, function(err,res) {
            var totalMember = res.totalMember
            db.collection('myScore').insertOne({_id: totalMember+1, id: req.body.id}, function(err,res){
                db.collection('member').insertOne({_id: totalMember+1, id: req.body.id, pw: encryptedPassword, pw_Q: req.body.pw_Q, pw_A: req.body.pw_A },function(err, res){
                    console.log('저장완료');
                    if (err) { 
                        console.log(err) 
                        return res.redirect('/register')
                    };
                });
            });
            db.collection('counter').updateOne({ name: 'totalMember' }, { $inc: { totalMember: 1 } }, function (err, res) {
                if (err) { return console.log(에러) }
            })
        })
    });
    res.redirect('/login')
});
// app.post('/register', function (req, res) {
//     // res.send('전송완료')
//     let encryptedPassword = '';
//     bcryptjs.hash(String(req.body.pw), 10, function(err, hash){
//         encryptedPassword = hash;
//         db.collection('score').insertOne({id: req.body.id}, function(err,res){
//             db.collection('member').insertOne({id: req.body.id, pw: encryptedPassword, pw_Q: req.body.pw_Q, pw_A: req.body.pw_A },function(err, res){
//                 console.log('저장완료');
//                 if (err) { 
//                     console.log(err) 
//                     return res.redirect('/register')
//                 };
//             });
//         });
//     });
//     res.redirect('/login')
// });



app.get('/sports', loadLoginData, function (req, res) {
    res.render('sports.ejs', {user: req.user.id});
});


app.post('/save_sports', loadLoginData, function (req, resp) {
    // console.log(req.user.id)
    // console.log(req.body)
    var userID = req.user
    db.collection('myScore').updateOne({id: req.user.id},
        {$inc: {swim : parseInt(req.body.swim_cnt), boxing : parseInt(req.body.boxing_cnt),
            pingpong : parseInt(req.body.pingpong_cnt), ski : parseInt(req.body.ski_cnt),
            score : 10*(req.body.swim_cnt+req.body.boxing_cnt+req.body.pingpong_cnt+req.body.ski_cnt)
        }
        }, function(err,res){
        // console.log(err)
        // console.log(res)
    },{ upsert: true })
    db.collection('counter').findOne({name : 'totalTimeScore'}, function(err,res) {
        var totalTimeScore = res.totalTimeScore
        var score = 10*(parseInt(req.body.swim_cnt)+parseInt(req.body.boxing_cnt)+parseInt(req.body.pingpong_cnt)+parseInt(req.body.ski_cnt))
        db.collection('timeScore').insertOne({_id: totalTimeScore+1, id: userID, swim : parseInt(req.body.swim_cnt), boxing : parseInt(req.body.boxing_cnt),
        pingpong : parseInt(req.body.pingpong_cnt), ski : parseInt(req.body.ski_cnt), score : score, updateTime : getCurrentDate()}, function (err, res) {
            if (err) { return console.log(에러) }
        })
        db.collection('counter').updateOne({ name: 'totalTimeScore' }, { $inc: { totalTimeScore: 1 } }, function (err, res) {
            if (err) { return console.log(에러) }
        })
    });
    return resp.redirect('/sports')
});

app.get('/muscleup', loadLoginData, function (req, res) {
    // res.send('뷰티 용품 쇼핑 페이지입니다');
    res.render('muscleup.ejs', {user: req.user.id});
});


app.post('/save_muscleup', loadLoginData, function (req, resp) {
    // console.log(req.user.id)
    // console.log(req.body)
    var userID = req.user.id
    db.collection('myScore').updateOne({id: req.user.id},
        {$inc: {squirt : parseInt(req.body.squirt_cnt), deadlift : parseInt(req.body.deadlift_cnt),
            curl : parseInt(req.body.curl_cnt), 
            score : (req.body.squirt_cnt+req.body.deadlift_cnt+req.body.curl_cnt)*30
        }
        }, function(err,res){
        // console.log(err)
        // console.log(res)
    },{ upsert: true })
    db.collection('counter').findOne({name : 'totalTimeScore'}, function(err,res) {
        var totalTimeScore = res.totalTimeScore
        var score = 30*(parseInt(req.body.squirt_cnt)+parseInt(req.body.deadlift_cnt)+parseInt(req.body.curl_cnt))
        db.collection('timeScore').insertOne({_id: totalTimeScore+1, id: userID, squirt : parseInt(req.body.squirt_cnt), deadlift : parseInt(req.body.deadlift_cnt),
            curl : parseInt(req.body.curl_cnt), score : score, updateTime : getCurrentDate()}, function (err, res) {
            if (err) { return console.log(에러) }
        })
        db.collection('counter').updateOne({ name: 'totalTimeScore' }, { $inc: { totalTimeScore: 1 } }, function (err, res) {
            if (err) { return console.log(에러) }
        })
    });
    return resp.redirect('/muscleup')
});




app.get('/', loadLoginData, function (req, res) {
    // res.send('뷰티 용품 쇼핑 페이지입니다');
    res.render('index.ejs', {user: req.user.id});
});

app.get('/muscleup', loadLoginData, function (req, res) {
    // res.send('뷰티 용품 쇼핑 페이지입니다');
    res.render('muscleup.ejs', {user: req.user.id});
});
app.get('/rsp', loadLoginData, function (req, res) {
    // res.send('뷰티 용품 쇼핑 페이지입니다');
    res.render('rsp.ejs', {user: req.user.id});
});
app.get('/updown', loadLoginData, function (req, res) {
    // res.send('뷰티 용품 쇼핑 페이지입니다');
    res.render('updown.ejs', {user: req.user.id});
});
app.get('/ranking', loadLoginData, function (req, res) {
    // res.send('뷰티 용품 쇼핑 페이지입니다');
    res.render('ranking.ejs', {user: req.user.id});
});


// app.get('/ranking', function (req, res) {
//     db.collection('post').find().toArray(function (err, data) {
//         console.log(data);
//         res.render('ranking.ejs', { posts: data });
//     });
// });





app.get('/login', function(req,resp){
    if (req.user){
        resp.redirect('/');
    } else {
    resp.render('login.ejs', {message : req.flash('loginMessage')});
}});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/sports',
    failureRedirect: '/login',
    failureFlash: true
    }), function(req,resp){
        resp.redirect('/') 
    });

app.get('/logout', function(req,res){
    req.logout();
    req.session.save(function(){
        res.redirect('/');
    });
    });

app.get('/flash', function(req, res){
    // Set a flash message by passing the key, followed by the value, to req.flash().
    req.flash('info', 'Flash is back!')                                              
    res.redirect('/');
  });
  

app.get('/mypage', loginConfirm, function(req, resp){
    let user = {}
    db.collection("myScore").findOne({id : req.user.id}, function(req,res){
        user = res
        delete user._id
        var sports = user.boxing+user.pingpong+user.ski+user.swim
        var muslceup = user.squirt+user.deadlift+user.curl
        var newScore = sports*10 + muslceup*30
        user.score = newScore
        db.collection("myScore").updateOne({id : user.id},{$set : { score: newScore}})
        console.log(user)
        resp.render('mypage.ejs', {user : user})
        
    });
});


function loginConfirm(req, resp, next){
    if (req.user){
        next()
    } else {

        resp.send('로그인이 필요한 페이지입니다.')
    }
}


function loadLoginData(req, resp, next){
    if (req.user){
        next()
    } else {
        req.user = {id : 'guest'}
        next()
        // resp.send('Guest.')
    }
}
        // resp.send("<script>alert('로그인이 필요합니다.'); location.href='/login';</script>")

function getCurrentDate() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth();
    var today = date.getDate();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var milliseconds = date.getMilliseconds();
    return new Date(Date.UTC(year, month, today, hours, minutes, seconds, milliseconds));

}

passport.use(new Localstrategy({
    usernameField: 'id',
    passwordField: 'pw',
    session: true,
    passReqToCallback: true,
}, function(req, inputId, inputPw, done){
    console.log(inputId, inputPw);
    db.collection('member').findOne({id:inputId}, function(err, res){
        let psword_result = '123';
        if (err) return done(err)
        if (!res) return done(null, false, req.flash('loginMessage', '아이디가 존재하지 않습니다.'))
        //req.flash('signinMessage', '아이디가 존재하지 않습니다.'));
        bcryptjs.compare(inputPw, res.pw).then(function(result){
            psword_result = result;
            if (psword_result == true){
                return done(null, res)
            } else {
                return done(null, false, req.flash('loginMessage', '비밀번호가 틀립니다.'))
            }
        });
    })   
}));

passport.serializeUser(function(user,done){
    done(null, user.id)
});
passport.deserializeUser(function(아이디, done){
    db.collection('member').findOne({id : 아이디}, function(err, res){
    done(null, res)
    })
}); 