<?php

/**
 * Klasse für alle möglichen Antworten.
 * Antworten an das Frontend müssen in Objekten einer Unterklasser dieser Klasse verschickt werden,
 * damit sie ausgewertet werden können.
 */
class Response {

    /**
     * Zeigt an, ob ein Fehler aufgetreten ist.
     * @var bool 
     */
    public $successful = true;

    /**
     * Falls ein Fehler aufgetreten ist, steht hier die Fehlermeldung.
     * @var string
     */
    public $errorMsg = "";

    /**
     * Beliebige Statusmeldung
     * @var string
     */
    public $message = "";

    /**
     * Beliebiges Datenobjekt
     * @var object
     */
    public $data;

    /**
     * Setzt den Fehlerfall auf wahr und gibt eine Fehlermeldung an.
     * @param string $msg Eine Beschreibung des aufgetretenen Fehlers.
     * @return void
     */
    public function setErrorMsg($msg) {
        $this->successful = false;
        $this->errorMsg = $msg;
    }

    function __construct($data, $message = "") {
        $this->data = $data;
        $this->message = $message;
    }

}

?>
