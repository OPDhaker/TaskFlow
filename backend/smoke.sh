#!/usr/bin/env bash
set -euo pipefail

base_url="http://localhost:8080"

basic=$(curl -sS -X POST "$base_url/tasks" -H "Content-Type: application/json" -d '{"type":"basic","title":"Read report","description":"prepare summary","dueDate":"2026-05-02T10:00:00Z","priority":"LOW"}')
urgent=$(curl -sS -X POST "$base_url/tasks" -H "Content-Type: application/json" -d '{"type":"urgent","title":"Ship demo","description":"college review","dueDate":"2026-05-01T18:00:00Z","priority":"HIGH","deadlineHours":6}')
recurring=$(curl -sS -X POST "$base_url/tasks" -H "Content-Type: application/json" -d '{"type":"recurring","title":"Standup","description":"weekly","dueDate":"2026-05-03T08:00:00Z","priority":"MEDIUM","intervalDays":7}')

basic_id=$(printf '%s' "$basic" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')
urgent_id=$(printf '%s' "$urgent" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')

curl -sS -X POST "$base_url/tasks" -H "Content-Type: application/json" -d "{\"type\":\"dependent\",\"title\":\"Present\",\"description\":\"after ship\",\"dueDate\":\"2026-05-04T10:00:00Z\",\"priority\":\"HIGH\",\"dependsOn\":[\"$urgent_id\"]}"
curl -sS -X PATCH "$base_url/tasks/$urgent_id" -H "Content-Type: application/json" -d '{"status":"DONE"}'
curl -sS -X POST "$base_url/tasks/$basic_id/start"
sleep 1
curl -sS -X POST "$base_url/tasks/$basic_id/stop"
curl -sS "$base_url/tasks/next"
curl -sS "$base_url/tasks/order"
curl -sS "$base_url/export"
