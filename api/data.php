<?php

$file = fopen('puzzle-ids-1.txt', 'r');

if ($file) {
    $ids = [];

    while (!feof($file)) {
        if (($line = fgets($file)) !== false) {
            $ids[] = $line;
        }
    }

    fclose($file);
}

// Pick a random index from the array.
$i = random_int(0, count($ids) - 1);

// Return a random puzzle index.
echo $ids[$i];



?>
