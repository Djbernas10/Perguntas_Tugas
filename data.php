<?php

function get_random_theme($random_theme_number)
{
    // depois de checkar o numero devolve o tema

	$themes= [
        "1" => "ciencia",
        "2" => "desporto",
        "3" => "historia",
        "4" => "ficcao",
        "5" => "videojogos",
	];
	
	foreach($themes as $numero=>$theme) 
	{
		if($numero==$random_theme_number) // compara o numero obtido no randomizer com um numero da lista de temas
		{
			return $theme; // retorna o tema randomizado
			break;
		}
	}
}
?>