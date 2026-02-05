<?php
/**
 * Simple Recipe API Backend
 * Handles storage of recipes, plans, and grocery lists using JSON files.
 */

header('Content-Type: application/json');
$baseDir = __DIR__ . '/../data';

// Ensure directories exist
$folders = ['recipes', 'meal-plans', 'grocery-lists', 'images'];
foreach ($folders as $folder) {
    if (!file_exists("$baseDir/$folder")) {
        mkdir("$baseDir/$folder", 0755, true);
    }
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'save_recipe':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data || !isset($data['name'])) {
            echo json_encode(['error' => 'Invalid data']);
            break;
        }
        $id = $data['id'] ?? uniqid();
        $data['id'] = $id;
        file_put_contents("$baseDir/recipes/$id.json", json_encode($data, JSON_PRETTY_PRINT));
        echo json_encode(['success' => true, 'id' => $id]);
        break;

    case 'list_recipes':
        $recipes = [];
        foreach (glob("$baseDir/recipes/*.json") as $file) {
            $recipes[] = json_decode(file_get_contents($file), true);
        }
        echo json_encode($recipes);
        break;

    case 'save_plan':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = 'current_plan'; // Keep it simple for MVP
        file_put_contents("$baseDir/meal-plans/$id.json", json_encode($data, JSON_PRETTY_PRINT));
        echo json_encode(['success' => true]);
        break;

    case 'get_plan':
        $file = "$baseDir/meal-plans/current_plan.json";
        if (file_exists($file)) {
            echo file_get_contents($file);
        } else {
            echo json_encode(['meals' => []]);
        }
        break;

    default:
        echo json_encode(['error' => 'Invalid action']);
}
