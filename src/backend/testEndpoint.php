<?php

if (!empty($_POST['url']) ) {
            $url = $_POST['url'];
            $date = date('l jS \of F Y h:i:s A');
            echo "You visited ".$url." at ".$date;
        }
?>
