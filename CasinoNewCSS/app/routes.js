module.exports = function(app, passport, db) {

  // normal routes ===============================================================

  // show the home page (will also have our login links)
  app.get('/', function(req, res) {
    res.render('index.ejs');
  });

  // PROFILE SECTION =========================
  app.get('/profile', isLoggedIn, function(req, res) {
    //================Profile.ejs gives player Money on first login===================//
  db.collection('info').find({name: req.user.local.email}).toArray((err2, result2) => {
  if (err2) return console.log(err2)
  //===================If nothing is found in collection, Make a new document======================//
  if (result2[0]===undefined){

          db.collection('info')
            .insert({
                name: req.user.local.email,
                winTotal: 0,
                loseTotal: 0,
                money: 10000,
                medal: ['https://i.imgur.com/nfnHp0D.png','https://i.imgur.com/k8gr5rJ.png','https://i.imgur.com/TdvOLOo.png', 'https://i.imgur.com/tIwjuLK.png', 'https://i.imgur.com/upicWNP.png', 'https://i.imgur.com/4uJsQVv.png'][Math.floor(Math.random()*6)]
              }) //===========Bowser, Bowser jr., Star, Ghost, Luigi, Shy Guy==============//

              ///Database needs a second to update before being rerender//
              setTimeout(()=>{
                db.collection('info').find({name: req.user.local.email}).toArray((err2, result2) => {
                  if (err2) return console.log(err2)
                  console.log('result2',result2[0])
                  res.render('profile.ejs', {
                    user: req.user,
                    info: result2[0]
                  })
                })
              },2000)

  } else{
    //================Render if something is found===============//
  res.render('profile.ejs', {
    user: req.user,
    info: result2[0]
  })}
})
  });

  app.get('/leader', function(req, res) {
      db.collection('info').find().toArray((err2, result2) => {
      if (err2) return console.log(err2)
      res.render('leader.ejs', {
        user: req.user,
        info: result2.sort((a,b)=>b.money-a.money)
      })
    });
  })


  app.get('/slots', function(req, res) {
    db.collection('info').find({name: req.user.local.email}).toArray((err2, result2) => {
    if (err2) return console.log(err2)
    res.render('slots.ejs', {
      user: req.user,
      info: result2[0]
    })
  });
})

  app.get('/roulette', function(req, res) {
    db.collection('info').find({name: req.user.local.email}).toArray((err2, result2) => {
    if (err2) return console.log(err2)
    res.render('roulette.ejs', {
      user: req.user,
      info: result2[0]
    })
  });
})

  app.get('/coinFlip', function(req, res) {
    db.collection('info').find({name: req.user.local.email}).toArray((err2, result2) => {
    if (err2) return console.log(err2)
    res.render('coin.ejs', {
      user: req.user,
      info: result2[0]
    })
  });
})

  app.put('/roll', function(req, res) {
    if(req.body.betOn==='black'||req.body.betOn==='red'){
    let roll = Math.floor(Math.random() * 2);
    var result
    if (roll === 0) {
      result = "win"
    } else {
      result = "lose"
    } {
      res.end(JSON.stringify(result));
    }
  }else{
  let roll = Math.ceil(Math.random() * 36);
  var result
  if (roll === +req.body.betOn) {
    result = "win"
  } else {
    result = "lose"
  } {
    res.end(JSON.stringify(result));
  }
  }


  });

    app.put('/flip', function(req, res) {
      let flip = Math.floor(Math.random() * 2);
      var result
      if (flip === 0) {
        result = "win"
      } else {
        result = "lose"
      } {
        res.end(JSON.stringify(result));
      }
    });

app.put('/medal', (req, res) => {
let buyMedal = {bowser: 'https://i.imgur.com/k8gr5rJ.png',
        shyGuy: 'https://i.imgur.com/4uJsQVv.png',
        squid: 'https://i.imgur.com/P92aZqt.png',
        koopa: 'https://i.imgur.com/jiVvO2R.png',
        hammer: 'https://i.imgur.com/su7Mghh.png',
      }
let newMedal = buyMedal[req.body.medal]
      console.log(newMedal)
    db.collection('info')
      .findOneAndUpdate({
        name: req.body.name
      }, {
        $set: {
          medal: newMedal,
          money: req.body.money -5000
        }
      }, {
        sort: {
          _id: -1
        },
        upsert: true
      }, (err, result) => {
        //Database needs a second to update before being rerender//
        setTimeout(()=>{
          db.collection('info').find({name: req.user.local.email}).toArray((err2, result2) => {
            if (err2) return console.log(err2)
            console.log('result2',result2[0])
            res.render('profile.ejs', {
              user: req.user,
              info: result2[0]
            })
          })
        },1000)

      })
  })


  app.put('/countMoney', (req, res) => {

    db.collection('info')
      .findOneAndUpdate({
        name: req.body.name
      }, {
        $set: {
          winTotal: req.body.winTotal,
          loseTotal: req.body.loseTotal,
          money: req.body.money
        }
      }, {
        sort: {
          _id: -1
        },
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
  })


  // LOGOUT ==============================
  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  // message board routes ===============================================================



  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================

  // locally --------------------------------
  // LOGIN ===============================
  // show the login form
  app.get('/login', function(req, res) {
    res.render('login.ejs', {
      message: req.flash('loginMessage')
    });
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // SIGNUP =================================
  // show the signup form
  app.get('/signup', function(req, res) {
    res.render('signup.ejs', {
      message: req.flash('signupMessage')
    });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // =============================================================================
  // UNLINK ACCOUNTS =============================================================
  // =============================================================================
  // used to unlink accounts. for social accounts, just remove the token
  // for local account, remove email and password
  // user account will stay active in case they want to reconnect in the future

  // local -----------------------------------
  app.get('/unlink/local', isLoggedIn, function(req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function(err) {
      res.redirect('/profile');
    });
  });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/');
}
