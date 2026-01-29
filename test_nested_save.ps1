$roomId = "test-room-" + (Get-Date).Ticks
$url = "http://localhost:3000/api/room/save"

# 1. Create a folder and a file inside it
$folderId = "folder-1"
$fileId = "file-1"

$files = @(
    @{
        id = $folderId
        name = "src"
        type = "folder"
        children = @($fileId)
    },
    @{
        id = $fileId
        name = "index.js"
        type = "file"
        content = "console.log('hello')"
        parentId = $folderId
    }
)

$payload = @{
    roomId = $roomId
    files = $files
} | ConvertTo-Json -Depth 5

Write-Host "Sending payload with nested file..."
Invoke-RestMethod -Uri $url -Method Post -Body $payload -ContentType "application/json"

# 2. Fetch it back
Write-Host "Fetching room data..."
$response = Invoke-RestMethod -Uri "$url?roomId=$roomId" -Method Get

$fetchedFiles = $response.room.files
Write-Host "Fetched files:"
$fetchedFiles | ConvertTo-Json -Depth 5

# Check if parentId persisted
$fetchedFile = $fetchedFiles | Where-Object { $_.id -eq $fileId }
if ($fetchedFile.parentId -eq $folderId) {
    Write-Host "SUCCESS: parentId persisted correctly." -ForegroundColor Green
} else {
    Write-Host "FAILURE: parentId lost or incorrect. Got: '$($fetchedFile.parentId)'" -ForegroundColor Red
}
