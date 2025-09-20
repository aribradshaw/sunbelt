<?php
require_once 'database/config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$portal = $_GET['portal'] ?? '';

if (!$portal) {
    http_response_code(400);
    echo json_encode(['error' => 'Portal parameter required']);
    exit();
}

try {
    $table_name = getTableName($portal);
    
    // Build query with optional filters
    $where_conditions = [];
    $params = [];
    
    if (isset($_GET['search']) && !empty($_GET['search'])) {
        $search = $_GET['search'];
        $where_conditions[] = "(first_name LIKE ? OR last_name LIKE ? OR street_address LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
        $params[] = "%$search%";
    }
    
    if (isset($_GET['status']) && !empty($_GET['status'])) {
        $where_conditions[] = "voter_status = ?";
        $params[] = $_GET['status'];
    }
    
    $where_clause = '';
    if (!empty($where_conditions)) {
        $where_clause = 'WHERE ' . implode(' AND ', $where_conditions);
    }
    
    // Get total count
    $count_sql = "SELECT COUNT(*) as total FROM $table_name $where_clause";
    $count_stmt = $pdo->prepare($count_sql);
    $count_stmt->execute($params);
    $total_count = $count_stmt->fetch()['total'];
    
    // Get voters with pagination
    $page = max(1, intval($_GET['page'] ?? 1));
    $limit = max(1, min(100, intval($_GET['limit'] ?? 50)));
    $offset = ($page - 1) * $limit;
    
    $sql = "SELECT * FROM $table_name $where_clause ORDER BY last_name, first_name LIMIT ? OFFSET ?";
    $params[] = $limit;
    $params[] = $offset;
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $voters = $stmt->fetchAll();
    
    // Convert boolean fields back to boolean values
    foreach ($voters as &$voter) {
        $voter['voter_texted'] = (bool)$voter['voter_texted'];
        $voter['voter_mailed'] = (bool)$voter['voter_mailed'];
        $voter['knocked_door'] = (bool)$voter['knocked_door'];
        $voter['voter_called'] = (bool)$voter['voter_called'];
        $voter['left_pamphlet'] = (bool)$voter['left_pamphlet'];
    }
    
    echo json_encode([
        'success' => true,
        'voters' => $voters,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $total_count,
            'pages' => ceil($total_count / $limit)
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Database fetch error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database fetch failed: ' . $e->getMessage()]);
}
?>
