<?php

// Pick a random file number.
$fileNb = random_int(1, 21);

$file = fopen('puzzle-ids/puzzle-ids-'.$fileNb.'.txt', 'r');

if ($file) {
    $ids = [];

    while (!feof($file)) {
        if (($line = fgets($file)) !== false) {
            $ids[] = $line;
        }
    }

    fclose($file);
}

// Pick a random index from the id array.
$i = random_int(0, count($ids) - 1);

// Return a random puzzle index.
echo $ids[$i];



?>
