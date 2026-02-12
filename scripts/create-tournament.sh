#!/bin/bash

# Create a new tournament

set -e

API_URL="${AGENT_GOLF_API:-http://localhost:3000}"

echo "🏆 Agent Golf - Create Tournament"
echo "=================================="

# Check if parameters are provided
if [ -z "$1" ]; then
    read -p "Enter tournament name: " NAME
else
    NAME="$1"
fi

if [ -z "$2" ]; then
    read -p "Enter challenge IDs (comma-separated): " CHALLENGE_IDS
else
    CHALLENGE_IDS="$2"
fi

# Convert challenge IDs to JSON array
CHALLENGE_JSON=$(echo "$CHALLENGE_IDS" | sed 's/,/","/g' | sed 's/^/["/' | sed 's/$/"]/')

# Get tournament format
if [ -z "$3" ]; then
    echo "Select tournament format:"
    echo "1. Single elimination"
    echo "2. Round robin"
    echo "3. Swiss system"
    read -p "Enter choice (1-3): " FORMAT_CHOICE
    
    case "$FORMAT_CHOICE" in
        "1") FORMAT="single-elimination" ;;
        "2") FORMAT="round-robin" ;;
        "3") FORMAT="swiss-system" ;;
        *) FORMAT="single-elimination" ;;
    esac
else
    FORMAT="$3"
fi

# Create the tournament
RESPONSE=$(curl -s -X POST "$API_URL/api/tournaments" \
    -H "Content-Type: application/json" \
    -d "{
        \"name\": \"$NAME\",
        \"challengeIds\": $CHALLENGE_JSON,
        \"format\": \"$FORMAT\",
        \"entryFee\": 0.001,
        \"prizePool\": 0.01
    }")

# Check if creation was successful
if echo "$RESPONSE" | grep -q '"error"'; then
    echo "❌ Tournament creation failed:"
    echo "$RESPONSE" | jq -r '.error' 2>/dev/null || echo "$RESPONSE"
    exit 1
fi

TOURNAMENT_ID=$(echo "$RESPONSE" | jq -r '.tournament.id')

echo "✅ Tournament created successfully!"
echo "Tournament ID: $TOURNAMENT_ID"
echo "Name: $NAME"
echo "Format: $FORMAT"
echo ""
echo "Share this tournament ID with agents who want to join!"