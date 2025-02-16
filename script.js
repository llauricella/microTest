function guardarNombre() {
    document.getElementById("nameButton").addEventListener("click", function(event) {
        const user = document.getElementById("nombre_jugador").value.trim();
        
        if (user) {
            localStorage.setItem("nombreUsuario", user);
            window.location.href = "game.html";
        } else {
            alert("Por favor ingresa tu nombre para jugar.");
        }
    });
}

function mostrarPopUp() {
    document.getElementById("popUp1").classList.add("open-popUp1");
}

function verPuntaje() {
    window.location.href = "points.html";
}

function irAtras() {
    if (window.location.pathname == "/game.html") {
        if(localStorage.getItem("leaderboard") == null) {
            localStorage.setItem("leaderboard", JSON.stringify({}));
        }

        var leaderboard = JSON.parse(localStorage.getItem("leaderboard"));
        const username = localStorage.getItem("nombreUsuario");
        if(leaderboard[username] == null || simon.getRoundsWon() > leaderboard[username]) {
            leaderboard[username] = simon.getRoundsWon();
            localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
        }
    }
    window.location.href = "index.html";
}

const round = document.getElementById('round');
const simonButtons = document.getElementsByClassName('square');
const startButton = document.getElementById('startButton');

class Simon {
    constructor(round, simonButtons, startButton) {
        this.round = 0;
        this.userPosition = 0;
        this.totalRounds = 10;
        this.sequence = [];
        this.speed = 1000;
        this.blockedButtons = true;
        this.buttons = Array.from(simonButtons);
        this.display = {
            "startButton": startButton, 
            "round": round
        };
        this.errorSound = new Audio('./sounds/error.mp3');
        this.buttonSounds = [
            new Audio('./sounds/1.mp3'),
            new Audio('./sounds/2.mp3'),
            new Audio('./sounds/3.mp3'),
            new Audio('./sounds/4.mp3')
        ];
    }

    init() {
        this.display.startButton.onclick = () => this.startGame();
    }

    startGame() {
        this.display.startButton.disabled = true; 
        this.updateRound(0);
        this.userPosition = 0;
        this.sequence = this.createSequence();
        this.buttons.forEach((element, i) => {
            element.classList.remove('winner');
            element.onclick = () => this.buttonClick(i);
        });
        this.showSequence();
    }

    updateRound(value) {
        this.round = value;
        this.display.round.textContent = `Round ${this.round}`;
    }

    createSequence() {
        return Array.from({length: this.totalRounds}, () =>  this.getRandomColor());
    }

    getRandomColor() {
        return Math.floor(Math.random() * 4);
    }

    buttonClick(value) {
        !this.blockedButtons && this.validateChosenColor(value);
    }

    validateChosenColor(value) {
        if(this.sequence[this.userPosition] === value) {
            this.buttonSounds[value].play();
            if(this.round === this.userPosition) {
                this.updateRound(this.round + 1);
                this.speed /= 1.02;
                this.isGameOver();
            } else {
                this.userPosition++;
            }
        } else {
            this.gameLost();
        }
    }

    isGameOver() {
        if (this.round === this.totalRounds) {
            this.gameWon();
        } else {
            this.userPosition = 0;
            this.showSequence();
        };
    }

    showSequence() {
        this.blockedButtons = true;
        let sequenceIndex = 0;
        let timer = setInterval(() => {
            const button = this.buttons[this.sequence[sequenceIndex]];
            this.buttonSounds[this.sequence[sequenceIndex]].play();
            this.toggleButtonStyle(button)
            setTimeout( () => this.toggleButtonStyle(button), this.speed / 2)
            sequenceIndex++;
            if (sequenceIndex > this.round) {
                this.blockedButtons = false;
                clearInterval(timer);
            }
        }, this.speed);
    }

    toggleButtonStyle(button) {
        button.classList.toggle('active');
    }

    gameLost() {
        this.errorSound.play();
        this.display.startButton.disabled = false; 
        this.blockedButtons = true;
        const popUp2 = document.getElementById("popUp2");
        popUp2.classList.add("open-popUp2");
    }

    gameWon() {
        this.display.startButton.disabled = false; 
        this.blockedButtons = true;
        this.buttons.forEach(element =>{
            element.classList.add('winner');
        });
        this.updateRound('10');
        localStorage.setItem("rondasGanadas", round);
        const popUp3 = document.getElementById("popUp3");
        popUp3.classList.add("open-popUp3");
    }

    getRoundsWon() {
        return this.round;
    }
}

const simon = new Simon(round, simonButtons, startButton);

(() => { 
    if(localStorage.getItem("leaderboard") == null) {
        localStorage.setItem("leaderboard", JSON.stringify({}));
    }

    if (window.location.pathname == "/game.html") {
        simon.init();
    } else if (window.location.pathname == "/points.html") {
        const nombreUsuario = localStorage.getItem("nombreUsuario");
        const puntaje = simon.getRoundsWon();
        const leaderboardDiv = document.getElementById("leaderboard");
        const leaderboardContainer = JSON.parse(localStorage.getItem("leaderboard"));
        const sortedLeaderboard = Object.entries(leaderboardContainer).sort((a, b) => b[1] - a[1]);
        sortedLeaderboard.forEach(([nombre, puntuacion]) => {
            const nombreDiv = document.createElement("div");
            nombreDiv.classList.add("grid-item");
            nombreDiv.textContent = nombre;
        
            const puntajeDiv = document.createElement("div");
            puntajeDiv.classList.add("grid-item");
            puntajeDiv.textContent = puntuacion;
        
            leaderboardDiv.appendChild(nombreDiv);
            leaderboardDiv.appendChild(puntajeDiv);
        });
    }
})();

function reiniciar() {
    simon.init();
}



