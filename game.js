var gameSocket // socket do jogo
//var temas = ["Ciencias","Desporto","Entretenimento","Historia","Arte","Geografia"]; // arreio de temas disponiveis para random~
var SOCKET_LIST = [];
var players = {};
const jsonFile = require("./questions.json")
var estado = 0 // 0 -fase de resposta 1- fase de resultados
exports.iniciar = function(socket){
    //Conexão
    gameSocket = socket

    //checkA();

    let lTimer = 100
    var teste = 5;


    /* JUNTAR À SALA */
    socket.on("juntar_sala",function(sala){ //juntar ao respetivo id da sala de jogo

        //checka para a exisitencia da sala no arreio de players
        if (sala in players) {        
        }
        else{
            //console.log(typeof(sala));
            players[sala]=[];    // cria o arreio com o did a sala como chave
        }

        
        socket.join(sala);// juntar a respetiva sala
        var playerId = Math.random();
        var objeto = {id: playerId, pontuacao:0, resposta:null}; //objeto do jogador
        SOCKET_LIST[playerId] = socket;
        players[sala].push(objeto)// id do jogador, pontuacao atual da ronda, resposta a uma pergunta
        //emite o id do player
        socket.emit("PlayerID", playerId); // emite o id do jogador (nao o id do socket)
        //console.log(jsonFile["Perguntas"][0]);
        //console.log(players);
        //checkA(sala);
       // genQ(sala); // temporario
    });

    /*
    // Host Events
    gameSocket.on('hostCreateNewGame', hostCreateNewGame);
    gameSocket.on('hostRoomFull', hostPrepareGame);
    gameSocket.on('hostCountdownFinished', hostStartGame);
    gameSocket.on('hostNextRound', hostNextRound);
    */




        /* *****************************
        *                              *
        *             Start            *
        *           Next Round         *
        *                              *
        * **************************** */

    socket.on("Temp_Lobby_Create",function(segundos,room){ // recebe do cliente que cria o lobby o pedido para inciar o countdown
        //console.log(segundos);
        //console.log(room);
        socket.to(room).emit("Lobby_Timer",segundos); // envia para todos os clientes neste gameSocket a sala em todos estão
    });


    /*
    Tema - Tema da pergunta
    Pergunta - Pergunta a responder
    respostas - respostas possiveis - depois comparar com o meu ficheiros json ou bd
    */

      
    socket.on("Start",function(room){ // rteceb resposta do cliente para comecar o jogo após o countdown
        console.log(room);
        var rondas = 3;
        console.log(rondas);
        socket.to(room).emit("Game_Started",rondas,function(response){
            console.log(response)
            console.log(response.status);

        }); // numero de rondas
    });

        /* *****************************
        *                              *
        *             CHAT             *
        *                              *
        ***************************** */

    socket.on("enviar_msg",function(msg,sala){ // ouve o evento de mandar msg
        socket.to(sala).emit("receber_msg", msg);
        console.log(msg);

    });

        /* *****************************
        *                              *
        *            FUNCOES           *
        *                              *
        ***************************** */
    
    function genQ(sala){//gerar questão
    
        let rIndex =  Math.floor(Math.random() * jsonFile["Perguntas"].length); //gera o indice para qual sera usado apora selecionar o tema
        let objQ = jsonFile["Perguntas"][rIndex] // guarda o tema na variavel
        console.log(objQ);
        estado = 1 // resultados


        socket.to(sala).emit("Questão",objQ,rIndex); // eniva a questão para a sala respetiva


    };

    function playerWinCheck (resposta,rIndex){

        var playerWins = false; // variavel para checkar se ganhou
        //resposta eé a string da resposta
   
        if(resposta == jsonFile["Perguntas"][rIndex]["Resposta"] ) // [0] for igual à resposta certa do json 
            playerWins = true;

        return playerWins;
    }

    function checkA(sala){ // checkar a resposta

        for(var player in players[sala]){
            console.log(player)
            /*
            var playerWin = playerWinCheck(players[i].move);
            if(playerWin){
                players[i].score += 1;
            }
            */
        };

    };

    setInterval(function(){
        //envia uma questao a cada 30 segundos  
        //genQ();
    }, 30000);
}