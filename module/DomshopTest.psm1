function Show-Result {
    param([string]$title, $result)
    Write-Host "`n=== $title ===" -ForegroundColor Cyan
    if ($null -ne $result.success) {
        if ($result.success -eq $true) {
            Write-Host "Успіх" -ForegroundColor Green
        } else {
            Write-Host "Помилка: $($result.message)" -ForegroundColor Red
        }
    }
    $result | Format-List
}

function Show-Log {
    param([int]$lines = 20)
    $logFile = "orders-$(Get-Date -Format 'yyyyMMdd').log"
    if (Test-Path $logFile) {
        Get-Content $logFile -Tail $lines
    } else {
        Write-Host "Файл $logFile ще не створений." -ForegroundColor Red
    }
}

function Update-Stats {
    param([string]$logFile)
    if (-not (Test-Path $logFile)) { return }

    $content = Get-Content $logFile
    $cleanContent = $content | Where-Object { $_ -notmatch "^Підсумкова статистика" }
    Set-Content -Path $logFile -Value $cleanContent -Encoding UTF8

    $blocks = $cleanContent -split "------------------------------"
    $orders = $blocks | Where-Object { $_.Trim() }

    $orderCount = ($orders | Measure-Object).Count
    $totalSum = ($orders | ForEach-Object {
        if ($_ -match "Total: (\d+) ₴") { [int]$matches[1] }
    } | Measure-Object -Sum).Sum

    $statsEntry = @"
Підсумкова статистика за $(Get-Date -Format 'yyyyMMdd'):
Кількість замовлень: $orderCount
Загальна сума: $totalSum ₴
------------------------------

"@
    Add-Content -Path $logFile -Value $statsEntry -Encoding UTF8
    Write-Host "Статистика оновлена у $logFile" -ForegroundColor Green
}

function Import-Orders {
    param([string]$jsonFile = "orders.json")
    if (-not (Test-Path $jsonFile)) {
        Write-Host "Файл $jsonFile не знайдено." -ForegroundColor Red
        return
    }

    $orders = Get-Content $jsonFile -Raw | ConvertFrom-Json
    $logFile = "orders-$(Get-Date -Format 'yyyyMMdd').log"

    foreach ($order in $orders) {
        $total = ($order.cart | ForEach-Object { $_.price * $_.qty } | Measure-Object -Sum).Sum
        $itemsCount = ($order.cart | ForEach-Object { $_.qty } | Measure-Object -Sum).Sum
        $customer = "$($order.name) $($order.surname)"
        $itemsDetails = ($order.cart | ForEach-Object { "$($_.name) ×$($_.qty) = $($_.price * $_.qty) ₴" }) -join "`n"

        $logEntry = @"
------------------------------
$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
OrderId: $($order.id)
Customer: $customer
Total: $total ₴
Items: $itemsCount
Details:
$itemsDetails
JSON:
$(ConvertTo-Json $order -Depth 5)
------------------------------

"@
        Add-Content -Path $logFile -Value $logEntry -Encoding UTF8
    }

    Update-Stats -logFile $logFile
}

Export-ModuleMember -Function Show-Result, Show-Log, Update-Stats, Import-Orders
