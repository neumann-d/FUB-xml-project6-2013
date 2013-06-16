<?php

/* ARC2 static class inclusion */ 
include_once('arc2/ARC2.php');

/* MySQL and endpoint configuration */ 
$config = array(
  /* login data for mysql server. 
   * Please try to configure your local database with these parameters
   */
  'db_host' => 'localhost', 
  'db_name' => 'xmlproject',
  'db_user' => 'xmlproject', // <- consider rights
  'db_pwd' => 'ja5ZrZV8xyzWXRWT',

  /* store name */
  'store_name' => 'xml_store',

  /* endpoint */
  'endpoint_features' => array(
    'select', 'construct', 'ask', 'describe', 
    'load', 'insert', 'delete', 
    'dump' /* dump is a special command for streaming SPOG export */
  ),
  'endpoint_timeout' => 60, /* not implemented in ARC2 preview */
  'endpoint_read_key' => '', /* optional */
  'endpoint_write_key' => 'REPLACE_THIS_WITH_SOME_KEY', /* optional, but without one, everyone can write! */
  'endpoint_max_limit' => 250, /* optional */
);

/* instantiation */
$ep = ARC2::getStoreEndpoint($config);

if (!$ep->isSetUp()) {
  $ep->setUp(); /* create MySQL tables */
}


?>
