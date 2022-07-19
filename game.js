var gameSocket // socket do jogo
var room;
exports.iniciar = function(socket){
   gameSocket = socket;

    /* JUNTAR À SALA */
    gameSocket.on("juntar_sala",function(sala){ //juntar ao respetivo id da sala de jogo
        socket.join(sala);// juntar a respetiva sala


    });
    //gameSocket.emit('connected', { message: "You are connected!" });

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

    gameSocket.on("Temp_Lobby_Create",function(segundos,room){ // recebe do cliente que cria o lobby o pedido para inciar o countdown
        //console.log(segundos);
        //console.log(room);
        socket.to(room).emit("Lobby_Timer",segundos); // envia para todos os clientes neste gameSocket a sala em todos estão

    });
    /*
    Tema - Tema da pergunta
    Pergunta - Pergunta a responder
    respostas - respostas possiveis - depois comparar com o meu ficheiros json ou bd
    */
   
    gameSocket.on("Start_Game",function(room){ // rteceb resposta do cliente para comecar o jogo após o countdown
        console.log(room);
        let rounds = 3;
        socket.to(room).emit("Game_Started",rounds); // numero de rondas
    });

    // Player Events
    /*
    gameSocket.on('playerJoinGame', playerJoinGame);
    gameSocket.on('playerAnswer', playerAnswer);
    gameSocket.on('playerRestart', playerRestart);
    */

        /* *****************************
        *                              *
        *             CHAT             *
        *                              *
        ***************************** */

    /*Eventos do chat*/
    gameSocket.on("enviar_msg",function(msg,sala){ // ouve o evento de mandar msg
        socket.to(sala).emit("receber_msg", msg);
        console.log(msg);

    });



        /* *****************************
        *                              *
        *            FUNCOES           *
        *                              *
        ***************************** */

    

}