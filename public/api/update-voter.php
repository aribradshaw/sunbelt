<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON input']);
    exit();
}

// Validate required fields
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

// Determine CSV file path based on portal
$csv_file = '';
switch ($portal) {
    case 'SouthAmherst':
        $csv_file = '../voters/csv/SAMHERSTchristians.csv';
        break;
    case 'Lorain':
        $csv_file = '../voters/csv/LorainMunicipalCourt.csv';
        break;
    case 'LD2':
        $csv_file = '../voters/csv/AZLD2.csv';
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid portal']);
        exit();
}

// Check if CSV file exists
if (!file_exists($csv_file)) {
    http_response_code(404);
    echo json_encode(['error' => 'CSV file not found']);
    exit();
}

// Read CSV file
$csv_data = [];
$headers = [];
$file_handle = fopen($csv_file, 'r');

if (!$file_handle) {
    http_response_code(500);
    echo json_encode(['error' => 'Could not read CSV file']);
    exit();
}

// Read headers
$headers = fgetcsv($file_handle);
if (!$headers) {
    fclose($file_handle);
    http_response_code(500);
    echo json_encode(['error' => 'Could not read CSV headers']);
    exit();
}

// Add status columns if they don't exist
$status_columns = ['Voter Status', 'Voter Texted', 'Voter Mailed', 'Knocked Door', 'Voter Called', 'Left Pamphlet'];
foreach ($status_columns as $col) {
    if (!in_array($col, $headers)) {
        $headers[] = $col;
    }
}

// Read all rows and pad with empty values for new columns
while (($row = fgetcsv($file_handle)) !== FALSE) {
    // Pad row with empty values for any new columns
    while (count($row) < count($headers)) {
        $row[] = '';
    }
    $csv_data[] = $row;
}
fclose($file_handle);

// Find the voter to update
$voter_found = false;
$updated_rows = [];

foreach ($csv_data as $row) {
    // Create voter ID using the same logic as frontend
    $firstName = $row[0] ?? ''; // First
    $lastName = $row[1] ?? '';  // Last
    $streetAddress = $row[6] ?? ''; // Street Address
    
    // Create address string (just the street address for South Amherst)
    $address = trim($streetAddress);
    $current_voter_id = strtolower(str_replace(' ', '-', $firstName . '-' . $lastName . '-' . $address));
    
    if ($current_voter_id === $voterId) {
        $voter_found = true;
        
        // Find the field index
        $field_index = array_search($field, $headers);
        if ($field_index !== false) {
            $row[$field_index] = $value;
        }
    }
    
    $updated_rows[] = $row;
}

if (!$voter_found) {
    http_response_code(404);
    echo json_encode(['error' => 'Voter not found']);
    exit();
}

// Write updated CSV back to file
$file_handle = fopen($csv_file, 'w');
if (!$file_handle) {
    http_response_code(500);
    echo json_encode(['error' => 'Could not write to CSV file']);
    exit();
}

// Write headers
fputcsv($file_handle, $headers);

// Write updated rows
foreach ($updated_rows as $row) {
    fputcsv($file_handle, $row);
}

fclose($file_handle);

// Return success
echo json_encode([
    'success' => true,
    'message' => 'Voter data updated successfully',
    'voterId' => $voterId,
    'field' => $field,
    'value' => $value
]);
?>
