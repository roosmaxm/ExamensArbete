<?php
/**
 * Router för PHP:s inbyggda utvecklingsserver.
 *
 *   php -S localhost:8000 router.php
 *
 * Den inbyggda servern stöder inte HTTP Range-anrop, vilket webbläsare kräver
 * för att kunna spola i videor. Det här skriptet levererar videofiler med stöd
 * för Range (svar 206 Partial Content) och låter servern hantera allt annat.
 * På en vanlig webbserver (Apache/nginx) behövs inte filen.
 */

$path = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
$types = ['mp4' => 'video/mp4', 'webm' => 'video/webm'];
$ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));

if (!isset($types[$ext])) {
    return false; // statiska filer, HTML, CSS och JS hanteras av servern
}

$root = realpath(__DIR__);
$file = realpath(__DIR__ . $path);
if ($file === false || strpos($file, $root) !== 0 || !is_file($file)) {
    http_response_code(404);
    exit;
}

$size = filesize($file);
$start = 0;
$end = $size - 1;

header('Content-Type: ' . $types[$ext]);
header('Accept-Ranges: bytes');

if (isset($_SERVER['HTTP_RANGE']) && preg_match('/bytes=(\d*)-(\d*)/', $_SERVER['HTTP_RANGE'], $m)) {
    if ($m[1] === '' && $m[2] !== '') {          // bytes=-500 (sista 500 byte)
        $start = max(0, $size - (int) $m[2]);
    } else {
        $start = (int) $m[1];
        if ($m[2] !== '') {
            $end = min((int) $m[2], $size - 1);
        }
    }
    if ($start > $end || $start >= $size) {
        http_response_code(416);
        header("Content-Range: bytes */$size");
        exit;
    }
    http_response_code(206);
    header("Content-Range: bytes $start-$end/$size");
}

$length = $end - $start + 1;
header('Content-Length: ' . $length);

$fp = fopen($file, 'rb');
fseek($fp, $start);
while ($length > 0 && !feof($fp)) {
    $chunk = fread($fp, min(65536, $length));
    echo $chunk;
    $length -= strlen($chunk);
}
fclose($fp);
