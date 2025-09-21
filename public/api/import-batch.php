<?php
require_once 'database/config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['portal']) || !isset($input['headers']) || !isset($input['data'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required parameters']);
    exit();
}

$portal = $input['portal'];
$headers = $input['headers'];
$data = $input['data'];

try {
    $table_name = getTableName($portal);
    
    // Create dynamic INSERT statement based on headers
    $columns = implode(',', array_map(function($h) { return "`$h`"; }, $headers));
    $placeholders = implode(',', array_fill(0, count($headers), '?'));
    
    $sql = "INSERT INTO $table_name ($columns) VALUES ($placeholders)";
    $stmt = $pdo->prepare($sql);
    
    $inserted = 0;
    foreach ($data as $row) {
        $values = array_map(function($h) use ($row) { return $row[$h] ?? ''; }, $headers);
        $stmt->execute($values);
        $inserted++;
    }
    
    echo json_encode([
        'success' => true,
        'message' => "Inserted $inserted rows",
        'count' => $inserted
    ]);
    
} catch (Exception $e) {
    error_log("Batch import error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Batch import failed: ' . $e->getMessage()]);
}
?>
