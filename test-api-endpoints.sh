#!/bin/bash

# Test de endpoints de la API
echo "🧪 Probando API de Agenda Digital Escolar"
echo "=========================================="

BASE_URL="http://localhost:3000"

echo ""
echo "1️⃣ Test endpoint principal:"
curl -s "$BASE_URL/" | head -5

echo ""
echo ""
echo "2️⃣ Test endpoint de salud:"
curl -s "$BASE_URL/api/health" | head -5

echo ""
echo ""
echo "3️⃣ Test endpoint de docentes:"
curl -s "$BASE_URL/api/docentes" | head -5

echo ""
echo ""
echo "4️⃣ Test endpoint de apoderados:"
curl -s "$BASE_URL/api/apoderados" | head -5

echo ""
echo ""
echo "5️⃣ Test endpoint de reportes:"
curl -s "$BASE_URL/api/reportes" | head -5

echo ""
echo ""
echo "✅ Tests de API completados"
