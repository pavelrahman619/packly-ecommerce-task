#!/bin/bash

# Test script for backend setup verification
BASE_URL="http://localhost:8080"

echo "🚀 Testing Furniture E-commerce Backend Setup..."
echo "================================================="

# Test basic health check
echo "1. Testing Health Check..."
curl -s "$BASE_URL/api/test/health" | json_pp 2>/dev/null || curl -s "$BASE_URL/api/test/health"
echo -e "\n"

# Test database connection
echo "2. Testing Database Connection..."
curl -s "$BASE_URL/api/test/db" | json_pp 2>/dev/null || curl -s "$BASE_URL/api/test/db"
echo -e "\n"

# Test environment variables
echo "3. Testing Environment Variables..."
curl -s "$BASE_URL/api/test/env" | json_pp 2>/dev/null || curl -s "$BASE_URL/api/test/env"
echo -e "\n"

# Test available routes
echo "4. Testing Available Routes..."
curl -s "$BASE_URL/api/test/routes" | json_pp 2>/dev/null || curl -s "$BASE_URL/api/test/routes"
echo -e "\n"

# Test system status
echo "5. Testing System Status..."
curl -s "$BASE_URL/api/test/status" | json_pp 2>/dev/null || curl -s "$BASE_URL/api/test/status"
echo -e "\n"

# Test basic root endpoint
echo "6. Testing Root Endpoint..."
curl -s "$BASE_URL/"
echo -e "\n\n"

echo "✅ Backend setup test completed!"
echo "If all tests show successful responses, your backend is properly configured."
