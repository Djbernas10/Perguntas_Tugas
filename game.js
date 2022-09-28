var gameSocket // socket do jogo
var SOCKET_LIST = [];
var players = {};
var rounds = {};
var player_backup = {};
var round_secs = 5;
const jsonFile = require("./questions.json")
var estado = 0 // 0 -fase de resposta 1- fase de resultados~

const pVariable = require("./player_variable");

/* FUNCTIONS */

function socketFlush(name,socket_id,sala){ //flush do socket
    
    for(var i=0;i<players[sala].length;i++){

        if(players[sala][i]["player_name"]==name){
            if(players[sala][i]["socket_id"] != socket_id){
                players[sala][i]["socket_id"]  = socket_id; //da flush do socket pelo novo
            }
        }

    }

}

function get_player(sala,name){

    for(var i=0;i<players[sala].length;i++){

        if(players[sala][i]["player_name"]==name){
            return i;
        }

    }

}

function genQ(room){//gerar questão
    
    let rIndex =  Math.floor(Math.random() * jsonFile["Perguntas"].length); //gera o indice para qual sera usado apora selecionar o tema
    let objQ = jsonFile["Perguntas"][rIndex] // guarda o tema na variavel
    //objQ["Resposta"]  = shuffleQ(objQ["Resposta"]);
    let pacote = [rIndex,objQ];

    players[room][0]["qIndex"] = rIndex; // guarda o index da pergunta
    
    return pacote;
    //socket.to(sala).emit("Questão",objQ,rIndex); // eniva a questão para a sala respetiva


};

function checkA(room){

    let qIndex = players[room][0]["qIndex"];

    for(var i=0;i<players[room].length;i++){
        if (players[room][i]["resposta"] === jsonFile["Perguntas"][qIndex]["Resposta"][0]){
            players[room][i]["pontuacao"] +=1;
        }   

    }

}

function shuffleQ(arr) {
    arr.sort(() => Math.random() - 0.5);
    return arr;
  }

exports.iniciar = function(socket,tempName){
    //Conexão
    gameSocket = socket
   
    
    /* JUNTAR À SALA */
    socket.on("juntar_sala",function(sala){ //juntar ao respetivo id da sala de jogo
        
        if(players[sala]){
        }
        else{
            players[sala]=[]; // cria o arreio com o id da sala como chave
        }
       
        socket.join(sala);// juntar a respetiva sala comum
        //console.log(socket.id);
        //socket.join(socket.id);//privado
        //console.log(socket);

        if(players[sala].length == 0){
            var pObjeto = {player_name:tempName,socket_id: socket.id, pontuacao:0, resposta:null,qIndex:null}; //objeto do jogador com a questao atual
        }
        else{
            var pObjeto = {player_name:tempName,socket_id: socket.id, pontuacao:0, resposta:null}; //objeto do jogador
        }
        //console.log(pObjeto);
    
        SOCKET_LIST[tempName] = socket;
        players[sala].push(pObjeto);// id do jogador, pontuacao atual da ronda, resposta a uma pergunta
        socketFlush(tempName,socket.id,sala); //flush do socket
    });


    /*DISCONNECT */
    /*
    socket.on("disconnect",function(){

    });
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

    socket.on("Start",function(room){ // rteceb resposta do cliente para comecar o jogo após o countdown
        rounds[room] = 5; // cira a sala nas rooms e dálhe o numero de rondas //5 rondas
        var questao = genQ(room);
        //console.log(rounds);
        //console.log(questao[1]);
        console.log("enviou")
       // console.log(players);
        //socket.emit("TESTE")
        socket.emit("Round",room,rounds[room],round_secs,questao[1]);
    });


    socket.on("Round_Timer_Server",function(segundos,room){
        socket.to(room).emit("Round_Timer_Client",segundos); 
    });

       /* *****************************
        *                              *
        *             GEN Q            *
        *                              *
        * **************************** */

       socket.on("GenQ",function(room){
            checkA(room);
            rounds[room] -=1; // diminui do total de rondas 
            let questao =  genQ(room);// gera a questao a entregar aos jogadores




            console.log(players);

        /*
            for(var i=0; i < players[room].length;i++){

                console.log(players[room][i]["socket_id"]);
    
                socket.to(players[room][i]["socket_id"]).emit("Round",room,rounds[room],round_secs,questao[1]);


            }
            */








            socket.emit("Round",room,rounds[room],round_secs,questao[1]); //emit para os users da sala
            pVariable.saveObject(players);
       });

        /* *****************************
        *                              *
        *            Resposta          *
        *                              *
        * **************************** */

       socket.on("Resposta",function(resposta,room,name){ // guarda a resposta da ronda para o jogador

        let pIndex = get_player(room,name);
        players[room][pIndex]["resposta"] = resposta; // coloca a resposta no objeto do jogador
        //console.log(players);
       });


        /* *****************************
        *                              *
        *             CHAT             *
        *                              *
        ***************************** */
    
    socket.on("enviar_msg",function(msg,sala){ // ouve o evento de mandar msg
        socket.to(sala).emit("receber_msg", msg);
       // console.log(msg);

    });
    
        /* *****************************
        *                              *
        *            FUNCOES           *
        *                              *
        ***************************** */

    function playerWinCheck (resposta,rIndex){

        var playerWins = false; // variavel para checkar se ganhou
        //resposta eé a string da resposta
   
        if(resposta == jsonFile["Perguntas"][rIndex]["Resposta"] ) // [0] for igual à resposta certa do json 
            playerWins = true;

        return playerWins;
    }

}