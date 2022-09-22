var gameSocket // socket do jogo
//var temas = ["Ciencias","Desporto","Entretenimento","Historia","Arte","Geografia"]; // arreio de temas disponiveis para random~
var SOCKET_LIST = [];
var players = {};
var rounds = {};
var player_backup = {};
var round_secs = 30;
const jsonFile = require("./questions.json")
var estado = 0 // 0 -fase de resposta 1- fase de resultados~

/* FUNCTIONS */

function socketFlush(name,socket_id,sala){ //flush do socket
    
    for(var i=0;i<players[sala].length;i++){

        if(players[sala][i]["player_name"]==name){
            if(players[sala][i]["socket_id"]!=socket_id){
                players[sala][i]["socket_id"]  = socket_id; //da flush do socket pelo novo
            }
        }

    }

}

exports.iniciar = function(socket,tempName){
    //Conexão
    gameSocket = socket
    //checkA();

    let lTimer = 100
    var teste = 5;


    /* JUNTAR À SALA */
    socket.on("juntar_sala",function(sala){ //juntar ao respetivo id da sala de jogo
        //checka para a exisitencia da sala no arreio de players
        /*
        if (sala in players) {        
        }
        else{
            //console.log(typeof(sala));
            */
            players[sala]=[];    // cria o arreio com o id da sala como chave
        //}

    
            
        socket.join(sala);// juntar a respetiva sala comum
        console.log(socket.id);
        socket.join(socket.id);//privado
        var playerId = Math.random();
        var pObjeto = {player_name:tempName,socket_id: socket.id, pontuacao:0, resposta:null}; //objeto do jogador
            //objeto do jogador
       // if(players[sala]["player_name"].find)


       /// e4scolher a sala
       // encontrar o nome
       //mudar o socket id
        SOCKET_LIST[tempName] = socket;
        //console.log(SOCKET_LIST);
        players[sala].push(pObjeto)// id do jogador, pontuacao atual da ronda, resposta a uma pergunta
        socketFlush(tempName,socket.id,sala); //flush do socket
        //console.log(players);
        
        
        //emite o id do player
        //socket.emit("PlayerID", playerId); // emite o id do jogador (nao o id do socket)
        //console.log(jsonFile["Perguntas"][0]);
        //console.log(players);
        //checkA(sala);
       // genQ(sala); // temporario
    });


    /*DISCONNECT */
    socket.on("disconnect",function(){

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
        rounds[room] = 5; // cira a sala nas rooms e dálhe o numero de rondas //5 rondas
        var questao = genQ();
        console.log(rounds);
        console.log(questao);
        socket.emit("Round",room,rounds[room],round_secs,questao);
    });


    socket.on("Round_Timer_Server",function(segundos,room){
        socket.to(room).emit("Round_Timer_Client",segundos); 
    });

       /* *****************************
        *                              *
        *             Start            *
        *                              *
        * **************************** */

       socket.on("GenQ",function(room){
           // console.log("é esta");
            console.log(room)
            rounds[room] -=1; // diminui do total de rondas 
            var questao =  genQ();// gera a questao a entregar aos jogadores
            socket.emit("Round",room,rounds[room],round_secs,questao,); //emit para os users da sala
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
    
    function genQ(){//gerar questão
    
        let rIndex =  Math.floor(Math.random() * jsonFile["Perguntas"].length); //gera o indice para qual sera usado apora selecionar o tema
        let objQ = jsonFile["Perguntas"][rIndex] // guarda o tema na variavel
        //console.log(objQ);
        estado = 1 // resultados

        return objQ;
        //socket.to(sala).emit("Questão",objQ,rIndex); // eniva a questão para a sala respetiva


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

// e4mit all sop pra sala em espe4cifico 
//mehlorar o objeto total das salas com o id(da db) do user e o nome
// on disconnect para dar refresh do socket.