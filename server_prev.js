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
const bcrypt = require('bcrypt');

MongoClient.connect('mongodb+srv://oneforthe:moneyand@cluster0.9dccx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', function (err, client) {
    if (err) return console.log(err)

    db = client.db('todoapp')

    app.listen(8080, function () {
        console.log('listening on 8080')
    });
});


app.get('/', function (req, res) {
    //res.send('뷰티 용품 쇼핑 페이지입니다');
    res.render('index.ejs', {})
});

app.get('/sports', function (req, res) {
    // res.send('뷰티 용품 쇼핑 페이지입니다');
    res.render('sports.ejs', {user: req.user});

});
app.get('/muscleup', function (req, res) {
    // res.send('뷰티 용품 쇼핑 페이지입니다');
    res.render('muscleup.ejs', {})

});
app.get('/rsp', function (req, res) {
    // res.send('뷰티 용품 쇼핑 페이지입니다');
    res.render('rsp.ejs', {})
});

app.get('/updown', function (req, res) {
    // res.send('뷰티 용품 쇼핑 페이지입니다');
    res.render('updown.ejs', {})
});

app.get('/ranking', function (req, res) {
    db.collection('post').find().toArray(function (err, data) {
        console.log(data);
        res.render('ranking.ejs', { posts: data });
    });
});

app.get('/test123', function (req, res) {
    db.collection('post').find().toArray(function (err, data) {
        console.log(data);
        res.render('test123.ejs', { posts: data });
    });

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
            // console.log('저장완료');
            db.collection('counter').updateOne({ name: '게시물갯수' }, { $inc: { totalPost: 1 } }, function (err, res) {
                if (err) { return console.log(에러) }

            })
        });
    res.redirect('/write')
    });
});

app.get('/register', function (req, res) {
    res.render('register.ejs');
});

app.post('/register', function (req, res) {
    // res.send('전송완료')
    let encryptedPassword = '';
    bcrypt.hash(String(req.body.pw), 10, function(err, hash){
        encryptedPassword = hash;
        db.collection('member').insertOne({id: req.body.id, pw: encryptedPassword, pw_Q: req.body.pw_Q, pw_A: req.body.pw_A },function(err, res){
            console.log('저장완료');
            if (err) { 
                console.log(err) 
                return res.redirect('/login')
            }
        });
        res.redirect('/login')
    })
});



app.delete('/delete', function (req, resp) {
    console.log(req.body)
    req.body._id = parseInt(req.body._id);
    db.collection('post').deleteOne(req.body, function (err, res) {
        console.log('삭제완료');
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


app.get('/mypage', loginConfirm, function(req, resp){
    // console.log(req.user);
    resp.render('mypage.ejs', {사용자 : req.user})
    
});




app.post('/save_sports', loginConfirm, function (req, resp) {
    db.collection('score').updateMany({id: req.user},
        {$inc: {swim : req.body.swim_cnt, boxing : req.body.boxing_cnt,
            pingpong : req.body.pingpong_cnt, ski : req.body.ski_cnt}
    },  function(err,res){
        console.log(err)
        console.log(res)
    })
});



const passport = require('passport')
const Localstrategy = require('passport-local').Strategy
const session = require('express-session')
app.use(session({secret : '비밀코드', resave : true, saveUninitialized : false}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.get('/login', function(req,resp){
    resp.render('login.ejs', {message : req.flash('loginMessage')});
});
// app.post('/login', passport.authenticate('local', {
//     successRedirect: '/sports',
//     failureRedirect: '/login',
//     failureFlash: true
//     })
// );

app.post('/login', passport.authenticate('local', {
    successRedirect: '/sports',
    failureRedirect: '/login',
    failureFlash: true
    }), function(req,resp){
        resp.redirect('/') 
    });
            
app.get('/flash', function(req, res){
  // Set a flash message by passing the key, followed by the value, to req.flash().
  req.flash('info', 'Flash is back!')                                              
  res.redirect('/');
});



function loginConfirm(req, resp, next){
    if (req.user){
        next()
    } else {
        resp.send('로그인이 필요한 페이지입니다.')
    }
}
        // resp.send("<script>alert('로그인이 필요합니다.'); location.href='/login';</script>")


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
        bcrypt.compare(inputPw, res.pw).then(function(result){
            psword_result = result;
            if (psword_result == true){
                return done(null, res)
            } else {
                return done(null, false, req.flash('loginMessage', '비밀번호가 틀립니다.'))
            }
        });
    })   
}));

// const id = require('express-session')
passport.serializeUser(function(user,done){
    done(null, user.id)
});
passport.deserializeUser(function(아이디, done){
    db.collection('member').findOne({id : 아이디}, function(err, res){
    done(null, res)
    })
}); 