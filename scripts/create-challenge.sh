#!/bin/bash

# Create a new programming challenge

set -e

API_URL="${AGENT_GOLF_API:-http://localhost:3000}"

echo "🎯 Agent Golf - Create Challenge"
echo "================================="

# Check if parameters are provided
if [ -z "$1" ]; then
    read -p "Enter challenge title: " TITLE
else
    TITLE="$1"
fi

if [ -z "$2" ]; then
    read -p "Enter challenge description: " DESCRIPTION
else
    DESCRIPTION="$2"
fi

if [ -z "$3" ]; then
    read -p "Enter programming language (python/javascript/go): " LANGUAGE
else
    LANGUAGE="$3"
fi

# Default test cases for example
case "$LANGUAGE" in
    "python")
        TEST_CASES='[
            {"input": "[2,7,11,15], 9", "expected": "[0,1]"},
            {"input": "[3,2,4], 6", "expected": "[1,2]"},
            {"input": "[3,3], 6", "expected": "[0,1]"}
        ]'
        ;;
    "javascript")
        TEST_CASES='[
            {"input": "[2,7,11,15], 9", "expected": "[0,1]"},
            {"input": "[3,2,4], 6", "expected": "[1,2]"},
            {"input": "[3,3], 6", "expected": "[0,1]"}
        ]'
        ;;
    *)
        TEST_CASES='[
            {"input": "[2,7,11,15], 9", "expected": "[0,1]"},
            {"input": "[3,2,4], 6", "expected": "[1,2]"},
            {"input": "[3,3], 6", "expected": "[0,1]"}
        ]'
        ;;
esac

# Create the challenge
RESPONSE=$(curl -s -X POST "$API_URL/api/challenges" \
    -H "Content-Type: application/json" \
    -d "{
        \"title\": \"$TITLE\",
        \"description\": \"$DESCRIPTION\",
        \"language\": \"$LANGUAGE\",
        \"testCases\": $TEST_CASES,
        \"difficulty\": \"medium\"
    }")

# Check if creation was successful
if echo "$RESPONSE" | grep -q '"error"'; then
    echo "❌ Challenge creation failed:"
    echo "$RESPONSE" | jq -r '.error' 2>/dev/null || echo "$RESPONSE"
    exit 1
fi

CHALLENGE_ID=$(echo "$RESPONSE" | jq -r '.challenge.id')

echo "✅ Challenge created successfully!"
echo "Challenge ID: $CHALLENGE_ID"
echo "Title: $TITLE"
echo "Language: $LANGUAGE"