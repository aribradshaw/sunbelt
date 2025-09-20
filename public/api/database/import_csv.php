<?php
require_once 'config.php';

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

if (!$input || !isset($input['portal'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Portal parameter required']);
    exit();
}

$portal = $input['portal'];

// Map CSV file paths
$csv_files = [
    'SouthAmherst' => '../../voters/csv/SAMHERSTchristians.csv',
    'Lorain' => '../../voters/csv/LorainMunicipalCourt.csv',
    'LD2' => '../../voters/csv/AZLD2.csv'
];

if (!isset($csv_files[$portal])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid portal']);
    exit();
}

$csv_file = $csv_files[$portal];

if (!file_exists($csv_file)) {
    http_response_code(404);
    echo json_encode(['error' => 'CSV file not found']);
    exit();
}

try {
    $table_name = getTableName($portal);
    
    // Clear existing data for this portal
    $stmt = $pdo->prepare("DELETE FROM $table_name");
    $stmt->execute();
    
    // Read and import CSV data
    $file_handle = fopen($csv_file, 'r');
    $headers = fgetcsv($file_handle);
    
    if (!$headers) {
        throw new Exception('Could not read CSV headers');
    }
    
    // Map CSV headers to database columns
    $column_mapping = [
        'First' => 'first_name',
        'Last' => 'last_name',
        'Phone Main' => 'phone_main',
        'Landline or Cell' => 'phone_type',
        'Phone 2' => 'phone_2',
        'Phone 3' => 'phone_3',
        'Street Address' => 'street_address',
        'Apt' => 'apt',
        'City' => 'city',
        'County' => 'county',
        'State' => 'state',
        'Zip Code' => 'zip_code',
        'Religion' => 'religion'
    ];
    
    $insert_sql = "INSERT INTO $table_name (
        first_name, last_name, phone_main, phone_type, phone_2, phone_3,
        street_address, apt, city, county, state, zip_code, religion
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $pdo->prepare($insert_sql);
    $imported_count = 0;
    
    while (($row = fgetcsv($file_handle)) !== FALSE) {
        $data = array_combine($headers, $row);
        
        $stmt->execute([
            $data['First'] ?? '',
            $data['Last'] ?? '',
            $data['Phone Main'] ?? '',
            $data['Landline or Cell'] ?? 'L',
            $data['Phone 2'] ?? '',
            $data['Phone 3'] ?? '',
            $data['Street Address'] ?? '',
            $data['Apt'] ?? '',
            $data['City'] ?? '',
            $data['County'] ?? '',
            $data['State'] ?? '',
            $data['Zip Code'] ?? '',
            $data['Religion'] ?? ''
        ]);
        
        $imported_count++;
    }
    
    fclose($file_handle);
    
    echo json_encode([
        'success' => true,
        'message' => "Successfully imported $imported_count voters for $portal",
        'count' => $imported_count
    ]);
    
} catch (Exception $e) {
    error_log("Import error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Import failed: ' . $e->getMessage()]);
}
?>
