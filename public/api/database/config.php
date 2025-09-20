<?php
// Database configuration for HostGator
// Replace these with your actual HostGator database credentials

$host = '192.232.249.125'; // HostGator database server
$dbname = 'redsaber_sunbelt_voters'; // Your database name
$username = 'redsaber_sunbelt'; // Your database username
$password = 'Vyuf6748!'; // Your database password

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    error_log("Database connection failed: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit();
}

// Helper function to get portal-specific table name
function getTableName($portal) {
    switch($portal) {
        case 'SouthAmherst':
            return 'voters';
        case 'Lorain':
            return 'lorain_voters';
        case 'LD2':
            return 'ld2_voters';
        default:
            throw new Exception("Invalid portal: $portal");
    }
}
?>
