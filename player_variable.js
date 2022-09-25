var players = {};


function saveObject(object){

    players = object; //  guarda o objeto dos jogadores na variavel global
};

function getObject(){

    let objeto = players;
    return objeto;

};

module.exports = {
    
    saveObject,
    getObject,
};