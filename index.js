/*Modulos E REQUIREMENTS */
const express =  require("express");  // importar o modulo do express
const host = '192.168.1.5'; // ip do meu portatil para todos os dispositivos se poderem ligar a ele
//192.168.1.75
//nord 100.67.125.212
//192.168.1.5
const porta = 8081; //porta que os outros dispositivos irao usar
const path = require('path');
const bodyParser = require("body-parser"); // modulo
var mysql = require("mysql"); // modulo do mysql
const session = require("express-session"); // modulo das sessoes
const rs = require("randomstring"); ////criar o hash para os lobbys
var game = require("./game"); // chama o ficheiro do jogo



/*FUNCOES */

function gen_id(){

    let hash;
    /*
    randomBytes(110, function(err, buf){
        if (err) throw err;
        hash = buf.toString('hex');
        return hash;
    });
    */
    hash = rs.generate( {length: 50}); //tamanho do hash
    return hash;


};

function close_window(){


};

//checka se está vazio
function isEmpty(object) {
    for (const property in object) {
      return false;
    }
    return true;
}



/*Variaveis globais */
var flag = false; // nao existe nenhum nome igual online

/*CRIACAO DO SERVIDOR EXPRESS */
const exp = express();// cria o servidor express

/* criacao do servidor http */
var server = require("http").createServer(exp);

/* Name Handler*/
var tempName = null;

/*Sessões */
//inicializa a sessao
exp.use(session({secret: 'segredomalandro', saveUninitialized: false, resave: false}));

/* criacao da variavel do web Socket */
var io = require('socket.io')(server);

/* BODY PARSER */
const urlEParser = bodyParser.urlencoded({extended: false}); // da parse dos dados enconded que vem da pagina

/* USE DAS PASTAS */
exp.use('/assets', express.static('assets'))


/*  VIEWS  */
exp.set("views","./views"); //saber a que pasta ir buscar os ficheiros ejs
exp.set("view engine","ejs"); //estabelece a view engine neste caso estou a usar o ejs


/* Socket ON */

io.on('connection',function(socket){ // saber se alguem conectou
    console.log(`Alguem conectou ${socket.id}`);
    //console.log(tempName);
    game.iniciar(socket,tempName); // entra no ficheiro do jogo

});


/* LIGACAO INCIAL VAI PARA AO INDEX */

exp.get("",function(req,res){ // quando nao tem nada a seguir ao 5000 ou seja vai para ao index (irei usar depois ajax para nunca sair desta pagina)
    // request e response

    res.redirect("/index") // redireciona para o menu inicial
})

/* INICIAL*/
exp.get("/index",function(req,res){ // renderiza o view do index

    let sess = req.session; // inicializa a sessao again para cada utilizador diferente

    //se ja existir
    
    if(typeof(sess.username) == "undefined" ){

        res.render("index"); // da render do meu html index
    }
    else{
        res.redirect("/lobby_search");//redireciona para o index
    }
})

/* GET LobbySearch */

exp.get("/lobby_search", function(req,res){ // get para quando acedemos ao gestor de lobbys
    
    let sess = req.session; // inicializa a sessao again para cada utilizador diferente
    let rooms; // salas de jogos
    
    //inicia a conexão
    var con = mysql.createConnection({ // cria a conexao à base de dados tal como tinha feito com o php

        multipleStatements: true,
        host:"localhost",
        user:"root",
        password:"",
        database: "perguntastugas"
    
    });
    

    //USAR PARA DELETAR O NOME NA BD QUANDO SE FECHA a janela
   // window.onbeforeunload

    //checka se tem algo dentro da varaivel de sessao
    if(typeof(sess.username) == "undefined" ){
        //console.log("ta vazio");
        res.redirect("/index");//redireciona para o index
    }
    else{
        //console.log("tem algo ");
        if(sess.introduzido == true) {// checka se já introduziu
            console.log(sess.username+" já introduzido na BD");
        }
        else{
              //coloca o utilizador na bd
            con.connect(function(err) { 
                if (err) {
                    console.log(err);
                    res.sendStatus(500);
                    return;
                } // se der erro mostra o erro senao diz conectado
            });

            con.query("INSERT into user (Nickname) VALUES('"+ sess.username +"') ",function(err,result){
                //console.log("[mysqlk error]",err);
                if (err){
                    console.log("[mysqlk error]",err);
                };
                console.log("Utilizador "+ sess.username  + " Conectou");
            });
            sess.introduzido= true; // como ja foi introduzido passa para true

        }
        
        con.query("SELECT * From sala", function(err,result){

            rooms  = result;
            //console.log(rooms);
            res.render("lobby_search",{Nome: sess.username , Salas : rooms}); // se exisitir variavel de sessão ele da render do teste
            //console.log(rooms)

        });

        con.end();
    }

});

/* USANDO O POST NO FORM DO NOME DO UTILIZADOR */

exp.post("/lobby_search",urlEParser,function(req,res){  // post depois do from iniical para entrar na lista de lobbys e adicionar o utilizador online à base de dados
    
        //É NECESSARIO criar novamente a conexão visto que assim a conexão deixa de ser assincrona
        var con = mysql.createConnection({ // cria a conexao à base de dados tal como tinha feito com o php

            multipleStatements: true,
            host:"localhost",
            user:"root",
            password:"",
            database: "perguntastugas"
        
        });
        
        /* Checka apora ver se o usuario ja existe*/

        var nome = req.body.username;

        con.connect(function(err) { // inicia a conexão
            if (err) {
                console.log(err);
                res.sendStatus(500);
                return;
            } // se der erro mostra o erro senao diz conectado
        }); 

            // Cheka a existencia do nome
            con.query("SELECT Nickname from user where Nickname ='"+nome+"'",function(err,result){

                var encontrado = JSON.parse(JSON.stringify(result)); // transforma o encontrado 

                if (encontrado == (null || "")){
                    //completa a entrada na lista de servidores disponivel
                    flag = false;

                    //session.Store.username=nome; Perguntar ao stor

                    let sess = req.session;// inicia a sessao
                    sess.username = nome; //coloca na variavel de sessão o username escolhido
                    sess.introduzido = false; // coloca a variavel booleana do registo de introducao a false
                    sess.host = false; //o user ainda nao criou nenhum lobby
                    res.redirect("/lobby_search"); // redireciona a apagina para o teste

                     // MUDAR PAR IR PAR O /ADD
                }
                else{
                    //console.log(encontrado[0]["Nickname"]);
                    flag = true;
                    console.log("Ja existe um usario online com o nome "+ nome)//indica na consola o nome da pessoa que se juntou
                    //console.log(flag);// indica se funcionou
                    res.redirect("/index"); //caso exista redireciona a a pagina para o index
                }
            });
            
       con.end(); // termina a conexão
});


/* logout / sair */ //apaga da base de dados o user que esta "logado"
exp.get("/logout", function(req,res){

    let sess = req.session; // inicializa a sessao again para cada utilziador diferente

    //É NECESSARIO criar novamente a conexão visto que assim a conexão deixa de ser assincrona
    var con = mysql.createConnection({ // cria a conexao à base de dados tal como tinha feito com o php

        multipleStatements: true,
        host:"localhost",
        user:"root",
        password:"",
        database: "perguntastugas"
    
    });

    //checka se esta "logado", ou seja em sessão
    if(typeof(sess.username) == "undefined" ){
        //console.log("ta vazio");
        res.redirect("/index");//redireciona para o index
    }
    // esta "logado" e em sessao
    else{
        con.connect(function(err) { // inicia a conexão
            if (err) {
                console.log(err);
                res.sendStatus(500);
                return;
            }
        }); // se der erro mostra o erro senao diz conectado
            // apaga o registo do nome da base de dados
            con.query("DELETE FROM user where Nickname ='"+sess.username+"'",function(err,result){
               
                    console.log("Usuario de nome "+ sess.username + " foi offline")//indica na consola o nome da pessoa ficou offline
                    sess.destroy(function(err){
                        if (err){
                            return console.log(err);
                        }   
                        else{
                            res.redirect("/index"); //redireciona devolta ao index
                        }                 
                    });
            });
        //}); 
        con.end(); // FUNCIONA SE AS QUERYS NAO TIVEREM DENTRO DO STATEMNT DA CONEXÂO
    }

});


/* CREATE LOBBY GET*/  
exp.get("/create_room",function(req,res){

    let sess = req.session;


  //checka se tem algo dentro da varaivel de sessao
    if(typeof(sess.username) == "undefined" ){
    //console.log("ta vazio");
    res.redirect("/index");//redireciona para o index
    }
    else{

    var con = mysql.createConnection({ // cria a conexao à base de dados tal como tinha feito com o php

        multipleStatements: true,
        host:"localhost",
        user:"root",
        password:"",
        database: "perguntastugas",
    
    });

    //eftua a conexão
    con.connect(function(err) { // inicia a conexão
        if (err) {
            console.log(err);
            res.sendStatus(500);
            return;
        }
    });

    //CRIA A SALA DE JOGO
    let hash_sala = gen_id(); // gera o hash da sala
    //let hash_sala = "6"; // gera o hash da sala
    let checkID = 0;
    var json; // varaivel que gaurda os resultados em json
    var empty; // variavel que guarda os resultados


    //while(checkID != 1){ // RESOLVER DEPOIS
        con.query("SELECT hash_sala from sala where hash_sala = '"+ hash_sala +"'",function(err,result){

            if (result.length == 0){ 
                
                empty = [];
                //console.log("vazio");
            }
            else{
                json = JSON.parse(JSON.stringify(result));
                empty = json[0]["hash_sala"];
                //console.log("algo")
            }
        });


        if (isEmpty(empty)){ // nao encontrou nada
            con.query("INSERT into sala (hash_sala,players) VALUES('"+ hash_sala +"',0) ",function(err,result){
                if (err){
                   console.log("[mysqlk error]",err);
                   //console.log("erro")
                };

                console.log("Sala Criada");// cria a sala

            });//coloca na bd
            con.query("UPDATE user SET sala_hash_sala = '"+ hash_sala +"' WHERE Nickname = '"+sess.username+"'",function(err,result){
                if (err){
                    console.log("[mysqlk error]",err);
                 };

            });//coloca na bd
            //checkID = 1;
        }
        /*
        else{//ja existe a sala
            hash_sala = gen_id();//gera again e cria a sala
            con.query("INSERT into sala (hash_sala,players) VALUES('"+ hash_sala +"',1) ",function(err,result){
                if (err){
                   // console.log("[mysqlk error]",err);
                   console.log("erro")
                };

                console.log("Sala Criada");// cria a sala

            });
        }   
        */
    //}
    
    con.end(); // termina a conexao
    sess.host = true;
    res.redirect(`/sala?id=${hash_sala}`);
    }
});



//TESTE

exp.get("/teste",function(req,res){
    
    var con = mysql.createConnection({ // cria a conexao à base de dados tal como tinha feito com o php

        multipleStatements: true,
        host:"localhost",
        user:"root",
        password:"",
        database: "perguntastugas"
    
    });

    //eftua a conexão
    con.connect(function(err) { // inicia a conexão
        if (err) {
            console.log(err);
            res.sendStatus(500);
            return;
        }
    });


    //con.query("INSERT into user (Nickname) VALUES('LIXOSOasdsad') ",function(err,result){});
    //con.query("INSERT into user (Nickname) VALUES('LIagdfsdfsd') ",function(err,result){});
    res.render("teste");



    con.end();


});

//socket
exp.get("/sala",function(req,res){
    
    let sess = req.session;

    var con = mysql.createConnection({ // cria a conexao à base de dados tal como tinha feito com o php

        multipleStatements: true,
        host:"localhost",
        user:"root",
        password:"",
        database: "perguntastugas"
    
    });

    //eftua a conexão
    con.connect(function(err) { // inicia a conexão
        if (err) {
            console.log(err);
            res.sendStatus(500);
            return;
        }
    });

    /* INTRODUZ O ID DA SALA NA BD no campo do USER*/
    con.query("UPDATE user SET sala_hash_sala = '"+ req.query.id +"' WHERE Nickname = '"+sess.username+"'",function(err,result){
        if (err){
            console.log("[mysqlk error]",err);
         };

    });


    /*ADIONAR +1 AO Numero de jogadores da sala*/
    con.query("UPDATE sala SET players = players + 1 WHERE hash_sala = '"+req.query.id+"'",function(err,result){
        if (err){
            console.log("[mysqlk error]",err);
         };

    });
    

    

    tempName = sess.username;
    res.render("sala", {Nome: sess.username, Host:sess.host});

    con.end

});

/* 404 NOT FOUND*/
exp.all("*",function(req,res){

    res.status(404).send("<h1>404 Página não encontrada</h1>")
 
});


server.listen(porta,host); // onde ligar
//server.listen(porta); //para local host
console.log("Funciona no ip e porta http://"+host+":"+porta);

