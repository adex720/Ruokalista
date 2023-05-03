<?php

function isMobile() {
    return preg_match("/(android|avantgo|blackberry|bolt|boost|cricket|docomo|fone|hiptop|mini|mobi|palm|phone|pie|tablet|up\.browser|up\.link|webos|wos)/i", $_SERVER["HTTP_USER_AGENT"]);
}

function respond_error ($message) {
    echo '{"status":400,"message":"' . $message . '"}';
}

function respond_value ($value) {
    echo '{"status":200,"value":"' . $value . '"}';
}

function respond_invalid_account () {
    echo '{"status":401,"value":"Invalid code"}';
}

/**
 * Returns true if the code matches code syntax.
 */
function is_code_valid($code){
    $regex = '/^[0-9a-f]{8}$';
    return preg_match($regex, $code);
}

/**
 * Returns true if the code matches a user on the database.
 */
function is_user($code, $json) {
    return array_key_exists($code, $json);
}

/**
 * Returns user information
 */
function get_user($code, $json) {
    $user = $json[$code];
    unset($json['id']);
    return json_encode($user);
}

function delete_user($code, $json) {
    $id = $json[$code]['id'];
    unset($json[$code]);
    save_json($json);
}

function load_json() {
    $file = file_get_contents(getenv('db_address'));
    return json_decode($file,true);
}

/**
 * Encodes and saves the json
 */
function save_json($json) {
    $encoded = json_encode($json);
    $file = fopen(getenv('db_address'), 'w');
    fwrite($file, $encoded);
    fclose($file);
}

$type = $_GET['type'];
$code = $_GET['code'];

if (!is_code_valid($code)) {
    respond_error('invalid code');
    return;
}

$json = load_json();

if ($type == 'validate') {
    respond_value(is_user($code, $json));
    return;
}

if (!is_user($code, $json)) {
    respond_invalid_account();
    return;
}

if ($type == 'get-times') {
   respond_value(get_user($type, $json));
} else if ($type == 'delete') {
    

} else if ($type == 'upload-schedule') {
    

} else if ($type == 'update-schedule') {
    

} else {
    respond_error('invalid action type');
}
?>
