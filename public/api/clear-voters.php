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

if (!$input || !isset($input['portal'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Portal parameter required']);
    exit();
}

$portal = $input['portal'];

try {
    $table_name = getTableName($portal);
    
    // Clear existing data
    $stmt = $pdo->prepare("DELETE FROM $table_name");
    $stmt->execute();
    
    echo json_encode([
        'success' => true,
        'message' => "Cleared existing data for $portal",
        'rows_affected' => $stmt->rowCount()
    ]);
    
} catch (Exception $e) {
    error_log("Clear error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Clear failed: ' . $e->getMessage()]);
}
?>
