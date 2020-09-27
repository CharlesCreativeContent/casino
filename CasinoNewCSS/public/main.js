let Player = {
    wins: document.getElementById("wins").innerHTML,
    loses: document.getElementById("loses").innerHTML,
    bet: document.querySelector('input').value,
    pocket: document.getElementById('pocket').innerHTML,
}

let Casino = {
  open: ()=>{
    document.querySelector('[type="submit"]').addEventListener('click', Casino.play)
    document.getElementById('slots').addEventListener('click', ()=>{alert('Coming Soon')})
  },
  play: ()=>{
    Player.bet = document.querySelector('input').value
     if (Player.bet.length!==0&&+Player.bet>0&&+Player.bet<=Player.pocket) {
      fetch(`/roll`, {
        method: 'put',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          'name': document.querySelector('h1').innerHTML.split(' ')[3],
          'bet': Player.bet,
          'betOn': document.querySelector('#color').value,
        })
      })
        .then(response => response.json())
        .then((result) => {
          Casino.winRes(result)
        });
    } else {
      alert('Enter a Valid Bet!')
    }
  },
  //=========================Displays the win or loss message===============================//
  winMsg: (msg)=>{document.getElementById("result").innerHTML = msg;},

  //==========================Keeps tracks of when the player loses=============================//
  winRes: (res)=>{
    Player.bet = document.querySelector('input').value

    if (res === 'win') {
      Player.pocket = +Player.pocket + +Player.bet
      document.getElementById('pocket').innerHTML = Player.pocket
      Player.wins++
      document.getElementById("wins").innerHTML = Player.wins;
      Casino.winMsg("You Won!");
      Casino.till()
    } else {
      Player.pocket = +Player.pocket - +Player.bet
      document.getElementById('pocket').innerHTML = Player.pocket
      Player.loses++
      document.getElementById("loses").innerHTML = Player.loses;
      Casino.winMsg("You Lost!");
      Casino.till()
    }
  },

  till: ()=>{
    fetch('/countMoney', {
      method: 'put',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'name': document.querySelector('h1').innerHTML.split(' ')[3],
        'winTotal': document.getElementById("wins").innerHTML,
        'loseTotal': document.getElementById("loses").innerHTML,
        'money': document.getElementById('pocket').innerHTML
      })
    })
  },
}

Casino.open()
