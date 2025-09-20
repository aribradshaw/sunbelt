<?php
require_once 'database/config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
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

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON input']);
    exit();
}

$required_fields = ['voterId', 'field', 'value', 'portal'];
foreach ($required_fields as $field) {
    if (!isset($input[$field])) {
        http_response_code(400);
        echo json_encode(['error' => "Missing required field: $field"]);
        exit();
    }
}

$voterId = $input['voterId'];
$field = $input['field'];
$value = $input['value'];
$portal = $input['portal'];

try {
    $table_name = getTableName($portal);
    
    // Map field names to database columns
    $field_mapping = [
        'Voter Status' => 'voter_status',
        'Voter Texted' => 'voter_texted',
        'Voter Mailed' => 'voter_mailed',
        'Knocked Door' => 'knocked_door',
        'Voter Called' => 'voter_called',
        'Left Pamphlet' => 'left_pamphlet'
    ];
    
    if (!isset($field_mapping[$field])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid field name']);
        exit();
    }
    
    $db_field = $field_mapping[$field];
    
    // Parse voter ID to extract name and address
    $voter_parts = explode('-', $voterId);
    if (count($voter_parts) < 3) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid voter ID format']);
        exit();
    }
    
    $first_name = str_replace('-', ' ', $voter_parts[0]);
    $last_name = str_replace('-', ' ', $voter_parts[1]);
    $address = str_replace('-', ' ', implode('-', array_slice($voter_parts, 2)));
    
    // Convert boolean values
    $db_value = $value;
    if (in_array($db_field, ['voter_texted', 'voter_mailed', 'knocked_door', 'voter_called', 'left_pamphlet'])) {
        $db_value = filter_var($value, FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
    }
    
    // Update the voter record
    $sql = "UPDATE $table_name SET $db_field = ? WHERE first_name = ? AND last_name = ? AND street_address = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$db_value, $first_name, $last_name, $address]);
    
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Voter not found']);
        exit();
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Voter data updated successfully',
        'voterId' => $voterId,
        'field' => $field,
        'value' => $value,
        'rows_affected' => $stmt->rowCount()
    ]);
    
} catch (Exception $e) {
    error_log("Database update error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database update failed: ' . $e->getMessage()]);
}
?>
